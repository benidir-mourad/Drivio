<?php

use App\Domains\Eleves\Models\Student;
use App\Domains\Moniteurs\Models\Instructor;
use App\Domains\Planning\Models\Lesson;
use App\Domains\Vehicules\Models\Vehicle;
use App\Models\User;

beforeEach(function (): void {
    $this->admin      = User::factory()->create()->assignRole('admin');
    $this->student    = Student::factory()->create();
    $this->instructor = Instructor::factory()->create();
    $this->vehicle    = Vehicle::factory()->create();
});

function existingLesson(Student $student, Instructor $instructor, Vehicle $vehicle): Lesson
{
    return Lesson::factory()->create([
        'student_id'    => $student->id,
        'instructor_id' => $instructor->id,
        'vehicle_id'    => $vehicle->id,
        'starts_at'     => '2030-06-10 09:00:00',
        'ends_at'       => '2030-06-10 10:00:00',
        'status'        => 'scheduled',
    ]);
}

test('creating a lesson with same instructor at overlapping time returns conflict', function (): void {
    existingLesson($this->student, $this->instructor, $this->vehicle);

    $other = Student::factory()->create();

    $this->actingAs($this->admin)
        ->postJson('/api/v1/lessons', [
            'student_id'    => $other->id,
            'instructor_id' => $this->instructor->id,
            'vehicle_id'    => null,
            'type'          => 'code',
            'starts_at'     => '2030-06-10 09:30:00',
            'ends_at'       => '2030-06-10 10:30:00',
        ])
        ->assertUnprocessable()
        ->assertJsonPath('code', 'CONFLICT')
        ->assertJsonFragment(['conflicts' => ['instructor']]);
});

test('creating a lesson with same vehicle at overlapping time returns conflict', function (): void {
    existingLesson($this->student, $this->instructor, $this->vehicle);

    $otherStudent    = Student::factory()->create();
    $otherInstructor = Instructor::factory()->create();

    $this->actingAs($this->admin)
        ->postJson('/api/v1/lessons', [
            'student_id'    => $otherStudent->id,
            'instructor_id' => $otherInstructor->id,
            'vehicle_id'    => $this->vehicle->id,
            'type'          => 'conduite',
            'starts_at'     => '2030-06-10 09:30:00',
            'ends_at'       => '2030-06-10 10:30:00',
        ])
        ->assertUnprocessable()
        ->assertJsonPath('code', 'CONFLICT')
        ->assertJsonFragment(['conflicts' => ['vehicle']]);
});

test('creating a lesson with same student at overlapping time returns conflict', function (): void {
    existingLesson($this->student, $this->instructor, $this->vehicle);

    $otherInstructor = Instructor::factory()->create();

    $this->actingAs($this->admin)
        ->postJson('/api/v1/lessons', [
            'student_id'    => $this->student->id,
            'instructor_id' => $otherInstructor->id,
            'vehicle_id'    => null,
            'type'          => 'code',
            'starts_at'     => '2030-06-10 09:30:00',
            'ends_at'       => '2030-06-10 10:30:00',
        ])
        ->assertUnprocessable()
        ->assertJsonPath('code', 'CONFLICT')
        ->assertJsonFragment(['conflicts' => ['student']]);
});

test('adjacent lessons without overlap do not conflict', function (): void {
    existingLesson($this->student, $this->instructor, $this->vehicle);

    $otherStudent = Student::factory()->create();

    // Starts exactly when the first one ends — no overlap
    $this->actingAs($this->admin)
        ->postJson('/api/v1/lessons', [
            'student_id'    => $otherStudent->id,
            'instructor_id' => $this->instructor->id,
            'vehicle_id'    => $this->vehicle->id,
            'type'          => 'conduite',
            'starts_at'     => '2030-06-10 10:00:00',
            'ends_at'       => '2030-06-10 11:00:00',
        ])
        ->assertCreated();
});

test('cancelled lessons are ignored in conflict check', function (): void {
    Lesson::factory()->create([
        'student_id'    => $this->student->id,
        'instructor_id' => $this->instructor->id,
        'vehicle_id'    => $this->vehicle->id,
        'starts_at'     => '2030-06-10 09:00:00',
        'ends_at'       => '2030-06-10 10:00:00',
        'status'        => 'cancelled',
    ]);

    // Same slot, same resources — should be allowed since prior lesson is cancelled
    $this->actingAs($this->admin)
        ->postJson('/api/v1/lessons', [
            'student_id'    => $this->student->id,
            'instructor_id' => $this->instructor->id,
            'vehicle_id'    => $this->vehicle->id,
            'type'          => 'conduite',
            'starts_at'     => '2030-06-10 09:00:00',
            'ends_at'       => '2030-06-10 10:00:00',
        ])
        ->assertCreated();
});

test('updating a lesson excludes itself from conflict check', function (): void {
    $lesson = existingLesson($this->student, $this->instructor, $this->vehicle);

    // Shift the lesson by 30 minutes — should not conflict with itself
    $this->actingAs($this->admin)
        ->putJson("/api/v1/lessons/{$lesson->id}", [
            'starts_at' => '2030-06-10 09:30:00',
            'ends_at'   => '2030-06-10 10:30:00',
        ])
        ->assertOk();
});
