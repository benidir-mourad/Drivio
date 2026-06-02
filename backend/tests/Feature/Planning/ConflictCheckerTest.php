<?php

use App\Domains\Eleves\Models\Student;
use App\Domains\Moniteurs\Models\Instructor;
use App\Domains\Planning\Models\Lesson;
use App\Domains\Planning\Services\ConflictChecker;
use App\Domains\Vehicules\Models\Vehicle;
use Carbon\Carbon;

beforeEach(function (): void {
    $this->checker    = new ConflictChecker;
    $this->student    = Student::factory()->create();
    $this->instructor = Instructor::factory()->create();
    $this->vehicle    = Vehicle::factory()->create();
});

test('no conflict when no lessons exist', function (): void {
    $result = $this->checker->check(
        $this->instructor->id,
        $this->student->id,
        $this->vehicle->id,
        Carbon::parse('2030-01-01 09:00'),
        Carbon::parse('2030-01-01 10:00'),
    );

    expect($result)->toBeEmpty();
});

test('detects instructor conflict on full overlap', function (): void {
    Lesson::factory()->create([
        'instructor_id' => $this->instructor->id,
        'student_id'    => Student::factory()->create()->id,
        'starts_at'     => '2030-01-01 09:00',
        'ends_at'       => '2030-01-01 10:00',
    ]);

    $result = $this->checker->check(
        $this->instructor->id,
        $this->student->id,
        null,
        Carbon::parse('2030-01-01 09:00'),
        Carbon::parse('2030-01-01 10:00'),
    );

    expect($result)->toContain('instructor');
});

test('detects conflict when new lesson starts before existing ends', function (): void {
    Lesson::factory()->create([
        'instructor_id' => $this->instructor->id,
        'student_id'    => Student::factory()->create()->id,
        'starts_at'     => '2030-01-01 09:00',
        'ends_at'       => '2030-01-01 10:00',
    ]);

    $result = $this->checker->check(
        $this->instructor->id,
        $this->student->id,
        null,
        Carbon::parse('2030-01-01 09:30'),
        Carbon::parse('2030-01-01 10:30'),
    );

    expect($result)->toContain('instructor');
});

test('detects conflict when new lesson ends after existing starts', function (): void {
    Lesson::factory()->create([
        'instructor_id' => $this->instructor->id,
        'student_id'    => Student::factory()->create()->id,
        'starts_at'     => '2030-01-01 09:00',
        'ends_at'       => '2030-01-01 10:00',
    ]);

    $result = $this->checker->check(
        $this->instructor->id,
        $this->student->id,
        null,
        Carbon::parse('2030-01-01 08:30'),
        Carbon::parse('2030-01-01 09:30'),
    );

    expect($result)->toContain('instructor');
});

test('no conflict for strictly adjacent lessons', function (): void {
    Lesson::factory()->create([
        'instructor_id' => $this->instructor->id,
        'student_id'    => $this->student->id,
        'vehicle_id'    => $this->vehicle->id,
        'starts_at'     => '2030-01-01 09:00',
        'ends_at'       => '2030-01-01 10:00',
    ]);

    $result = $this->checker->check(
        $this->instructor->id,
        $this->student->id,
        $this->vehicle->id,
        Carbon::parse('2030-01-01 10:00'),
        Carbon::parse('2030-01-01 11:00'),
    );

    expect($result)->toBeEmpty();
});

test('cancelled lessons are excluded from conflict detection', function (): void {
    Lesson::factory()->cancelled()->create([
        'instructor_id' => $this->instructor->id,
        'student_id'    => $this->student->id,
        'vehicle_id'    => $this->vehicle->id,
        'starts_at'     => '2030-01-01 09:00',
        'ends_at'       => '2030-01-01 10:00',
    ]);

    $result = $this->checker->check(
        $this->instructor->id,
        $this->student->id,
        $this->vehicle->id,
        Carbon::parse('2030-01-01 09:00'),
        Carbon::parse('2030-01-01 10:00'),
    );

    expect($result)->toBeEmpty();
});

test('excludeLessonId ignores the lesson itself', function (): void {
    $lesson = Lesson::factory()->create([
        'instructor_id' => $this->instructor->id,
        'student_id'    => $this->student->id,
        'vehicle_id'    => $this->vehicle->id,
        'starts_at'     => '2030-01-01 09:00',
        'ends_at'       => '2030-01-01 10:00',
    ]);

    $result = $this->checker->check(
        $this->instructor->id,
        $this->student->id,
        $this->vehicle->id,
        Carbon::parse('2030-01-01 09:00'),
        Carbon::parse('2030-01-01 10:00'),
        excludeLessonId: $lesson->id,
    );

    expect($result)->toBeEmpty();
});

test('detects all three conflicts simultaneously', function (): void {
    Lesson::factory()->create([
        'instructor_id' => $this->instructor->id,
        'student_id'    => $this->student->id,
        'vehicle_id'    => $this->vehicle->id,
        'starts_at'     => '2030-01-01 09:00',
        'ends_at'       => '2030-01-01 10:00',
    ]);

    $result = $this->checker->check(
        $this->instructor->id,
        $this->student->id,
        $this->vehicle->id,
        Carbon::parse('2030-01-01 09:30'),
        Carbon::parse('2030-01-01 10:30'),
    );

    expect($result)
        ->toContain('instructor')
        ->toContain('vehicle')
        ->toContain('student');
});

test('null vehicle_id is never flagged as a conflict', function (): void {
    Lesson::factory()->create([
        'instructor_id' => $this->instructor->id,
        'student_id'    => Student::factory()->create()->id,
        'vehicle_id'    => $this->vehicle->id,
        'starts_at'     => '2030-01-01 09:00',
        'ends_at'       => '2030-01-01 10:00',
    ]);

    $result = $this->checker->check(
        Instructor::factory()->create()->id,
        $this->student->id,
        vehicleId: null,
        startsAt: Carbon::parse('2030-01-01 09:00'),
        endsAt: Carbon::parse('2030-01-01 10:00'),
    );

    expect($result)->not->toContain('vehicle');
});
