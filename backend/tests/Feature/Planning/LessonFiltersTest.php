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

function planLesson(array $attrs = []): Lesson
{
    return Lesson::factory()->create(array_merge([
        'student_id'    => Student::factory()->create()->id,
        'instructor_id' => Instructor::factory()->create()->id,
    ], $attrs));
}

// --- index filters ---

test('index filters by date_from', function (): void {
    planLesson(['starts_at' => '2030-03-01 09:00', 'ends_at' => '2030-03-01 10:00']);
    planLesson(['starts_at' => '2030-03-05 09:00', 'ends_at' => '2030-03-05 10:00']);

    $this->actingAs($this->admin)
        ->getJson('/api/v1/lessons?date_from=2030-03-03')
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

test('index filters by date_to', function (): void {
    planLesson(['starts_at' => '2030-03-01 09:00', 'ends_at' => '2030-03-01 10:00']);
    planLesson(['starts_at' => '2030-03-05 09:00', 'ends_at' => '2030-03-05 10:00']);

    $this->actingAs($this->admin)
        ->getJson('/api/v1/lessons?date_to=2030-03-02')
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

test('index filters by instructor_id', function (): void {
    planLesson(['instructor_id' => $this->instructor->id, 'starts_at' => '2030-04-01 09:00', 'ends_at' => '2030-04-01 10:00']);
    planLesson(['starts_at' => '2030-04-01 11:00', 'ends_at' => '2030-04-01 12:00']); // other instructor

    $this->actingAs($this->admin)
        ->getJson("/api/v1/lessons?instructor_id={$this->instructor->id}")
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

test('index filters by student_id', function (): void {
    planLesson(['student_id' => $this->student->id, 'starts_at' => '2030-04-02 09:00', 'ends_at' => '2030-04-02 10:00']);
    planLesson(['starts_at' => '2030-04-02 11:00', 'ends_at' => '2030-04-02 12:00']); // other student

    $this->actingAs($this->admin)
        ->getJson("/api/v1/lessons?student_id={$this->student->id}")
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

test('index filters by status', function (): void {
    planLesson(['starts_at' => '2030-05-01 09:00', 'ends_at' => '2030-05-01 10:00', 'status' => 'scheduled']);
    planLesson(['starts_at' => '2030-05-01 11:00', 'ends_at' => '2030-05-01 12:00', 'status' => 'completed']);
    planLesson(['starts_at' => '2030-05-01 13:00', 'ends_at' => '2030-05-01 14:00', 'status' => 'cancelled']);

    $this->actingAs($this->admin)
        ->getJson('/api/v1/lessons?status=scheduled')
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

test('index filters by type', function (): void {
    planLesson(['starts_at' => '2030-05-02 09:00', 'ends_at' => '2030-05-02 10:00', 'type' => 'conduite']);
    planLesson(['starts_at' => '2030-05-02 11:00', 'ends_at' => '2030-05-02 12:00', 'type' => 'code']);

    $this->actingAs($this->admin)
        ->getJson('/api/v1/lessons?type=code')
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

// --- calendar ---

test('calendar returns all days in the requested range even if empty', function (): void {
    $response = $this->actingAs($this->admin)
        ->getJson('/api/v1/lessons/calendar?date_from=2030-06-02&date_to=2030-06-08')
        ->assertOk();

    $data = $response->json('data');
    expect($data)->toHaveCount(7)
        ->and(array_keys($data))->toContain('2030-06-02', '2030-06-08');
});

test('calendar places lessons on the correct day', function (): void {
    Lesson::factory()->create([
        'student_id'    => $this->student->id,
        'instructor_id' => $this->instructor->id,
        'starts_at'     => '2030-06-04 10:00',
        'ends_at'       => '2030-06-04 11:00',
    ]);

    $response = $this->actingAs($this->admin)
        ->getJson('/api/v1/lessons/calendar?date_from=2030-06-02&date_to=2030-06-08')
        ->assertOk();

    expect($response->json('data.2030-06-04'))->toHaveCount(1)
        ->and($response->json('data.2030-06-02'))->toHaveCount(0);
});

// --- role access ---

test('eleve sees only their own lessons in list', function (): void {
    $user       = User::factory()->create()->assignRole('eleve');
    $ownStudent = Student::factory()->create(['user_id' => $user->id]);

    Lesson::factory()->create([
        'student_id'    => $ownStudent->id,
        'instructor_id' => $this->instructor->id,
        'starts_at'     => '2030-07-01 09:00',
        'ends_at'       => '2030-07-01 10:00',
    ]);
    planLesson(['starts_at' => '2030-07-01 11:00', 'ends_at' => '2030-07-01 12:00']);

    $this->actingAs($user)
        ->getJson('/api/v1/lessons')
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

test('eleve can view their own lesson detail', function (): void {
    $user       = User::factory()->create()->assignRole('eleve');
    $ownStudent = Student::factory()->create(['user_id' => $user->id]);

    $lesson = Lesson::factory()->create([
        'student_id'    => $ownStudent->id,
        'instructor_id' => $this->instructor->id,
        'starts_at'     => '2030-07-02 09:00',
        'ends_at'       => '2030-07-02 10:00',
    ]);

    $this->actingAs($user)
        ->getJson("/api/v1/lessons/{$lesson->id}")
        ->assertOk();
});

// --- invalid state transitions ---

test('cannot cancel an already completed lesson', function (): void {
    $secretaire = User::factory()->create()->assignRole('secretaire');
    $lesson     = planLesson(['starts_at' => '2030-08-01 09:00', 'ends_at' => '2030-08-01 10:00', 'status' => 'completed']);

    $this->actingAs($secretaire)
        ->patchJson("/api/v1/lessons/{$lesson->id}/cancel")
        ->assertForbidden();
});

test('cannot complete an already cancelled lesson', function (): void {
    $admin  = User::factory()->create()->assignRole('admin');
    $lesson = planLesson(['starts_at' => '2030-08-02 09:00', 'ends_at' => '2030-08-02 10:00', 'status' => 'cancelled']);

    $this->actingAs($admin)
        ->patchJson("/api/v1/lessons/{$lesson->id}/complete")
        ->assertForbidden();
});

test('moniteur cannot complete a lesson that is not theirs', function (): void {
    $user   = User::factory()->create()->assignRole('moniteur');
    $lesson = planLesson(['starts_at' => '2030-08-03 09:00', 'ends_at' => '2030-08-03 10:00']);

    $this->actingAs($user)
        ->patchJson("/api/v1/lessons/{$lesson->id}/complete")
        ->assertForbidden();
});

test('moniteur can mark no-show on their own lesson', function (): void {
    $user       = User::factory()->create()->assignRole('moniteur');
    $instructor = Instructor::factory()->create(['user_id' => $user->id]);

    $lesson = Lesson::factory()->create([
        'instructor_id' => $instructor->id,
        'student_id'    => $this->student->id,
        'starts_at'     => '2030-09-01 09:00',
        'ends_at'       => '2030-09-01 10:00',
    ]);

    $this->actingAs($user)
        ->patchJson("/api/v1/lessons/{$lesson->id}/no-show")
        ->assertOk()
        ->assertJsonPath('data.status', 'no_show');
});

test('duration_minutes is correctly computed in response', function (): void {
    Lesson::factory()->create([
        'student_id'    => $this->student->id,
        'instructor_id' => $this->instructor->id,
        'starts_at'     => '2030-09-10 09:00',
        'ends_at'       => '2030-09-10 10:30',
    ]);

    $this->actingAs($this->admin)
        ->getJson('/api/v1/lessons')
        ->assertOk()
        ->assertJsonPath('data.0.duration_minutes', 90);
});
