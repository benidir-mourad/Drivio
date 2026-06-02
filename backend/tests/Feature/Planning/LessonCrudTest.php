<?php

use App\Domains\Eleves\Models\Student;
use App\Domains\Moniteurs\Models\Instructor;
use App\Domains\Planning\Models\Lesson;
use App\Domains\Vehicules\Models\Vehicle;
use App\Models\User;

function makeLesson(array $overrides = []): Lesson
{
    $student    = Student::factory()->create();
    $instructor = Instructor::factory()->create();
    $vehicle    = Vehicle::factory()->create();

    return Lesson::factory()->create(array_merge([
        'student_id'    => $student->id,
        'instructor_id' => $instructor->id,
        'vehicle_id'    => $vehicle->id,
    ], $overrides));
}

function lessonPayload(array $overrides = []): array
{
    $student    = Student::factory()->create();
    $instructor = Instructor::factory()->create();
    $vehicle    = Vehicle::factory()->create();

    return array_merge([
        'student_id'    => $student->id,
        'instructor_id' => $instructor->id,
        'vehicle_id'    => $vehicle->id,
        'type'          => 'conduite',
        'starts_at'     => '2030-01-15 09:00:00',
        'ends_at'       => '2030-01-15 10:00:00',
    ], $overrides);
}

// --- index ---

test('admin can list lessons', function (): void {
    $admin = User::factory()->create()->assignRole('admin');
    makeLesson();

    $this->actingAs($admin)
        ->getJson('/api/v1/lessons')
        ->assertOk()
        ->assertJsonStructure(['data', 'meta']);
});

test('unauthenticated request is rejected', function (): void {
    $this->getJson('/api/v1/lessons')->assertUnauthorized();
});

test('moniteur only sees their own lessons', function (): void {
    $user       = User::factory()->create()->assignRole('moniteur');
    $instructor = Instructor::factory()->create(['user_id' => $user->id]);
    $student    = Student::factory()->create();

    Lesson::factory()->create([
        'instructor_id' => $instructor->id,
        'student_id'    => $student->id,
        'starts_at'     => '2030-02-01 09:00:00',
        'ends_at'       => '2030-02-01 10:00:00',
    ]);
    makeLesson(); // another instructor's lesson

    $this->actingAs($user)
        ->getJson('/api/v1/lessons')
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

// --- calendar ---

test('admin can access calendar endpoint', function (): void {
    $admin = User::factory()->create()->assignRole('admin');

    $this->actingAs($admin)
        ->getJson('/api/v1/lessons/calendar?date_from=2030-01-13&date_to=2030-01-19')
        ->assertOk()
        ->assertJsonStructure(['data']);
});

// --- show ---

test('admin can view a lesson', function (): void {
    $admin  = User::factory()->create()->assignRole('admin');
    $lesson = makeLesson();

    $this->actingAs($admin)
        ->getJson("/api/v1/lessons/{$lesson->id}")
        ->assertOk()
        ->assertJsonPath('data.id', $lesson->id)
        ->assertJsonStructure(['data' => ['student', 'instructor', 'vehicle']]);
});

test('eleve cannot view another student lesson', function (): void {
    $user   = User::factory()->create()->assignRole('eleve');
    $lesson = makeLesson();

    $this->actingAs($user)
        ->getJson("/api/v1/lessons/{$lesson->id}")
        ->assertForbidden();
});

// --- store ---

test('admin can create a lesson', function (): void {
    $admin   = User::factory()->create()->assignRole('admin');
    $payload = lessonPayload();

    $this->actingAs($admin)
        ->postJson('/api/v1/lessons', $payload)
        ->assertCreated()
        ->assertJsonPath('data.type', 'conduite')
        ->assertJsonPath('data.status', 'scheduled');
});

test('secretaire can create a lesson', function (): void {
    $secretaire = User::factory()->create()->assignRole('secretaire');

    $this->actingAs($secretaire)
        ->postJson('/api/v1/lessons', lessonPayload())
        ->assertCreated();
});

test('moniteur cannot create a lesson', function (): void {
    $moniteur = User::factory()->create()->assignRole('moniteur');

    $this->actingAs($moniteur)
        ->postJson('/api/v1/lessons', lessonPayload())
        ->assertForbidden();
});

test('store validates required fields', function (): void {
    $admin = User::factory()->create()->assignRole('admin');

    $this->actingAs($admin)
        ->postJson('/api/v1/lessons', [])
        ->assertUnprocessable();
});

test('store rejects ends_at before starts_at', function (): void {
    $admin = User::factory()->create()->assignRole('admin');

    $this->actingAs($admin)
        ->postJson('/api/v1/lessons', lessonPayload([
            'starts_at' => '2030-01-15 10:00:00',
            'ends_at'   => '2030-01-15 09:00:00',
        ]))
        ->assertUnprocessable();
});

// --- update ---

test('admin can update a lesson', function (): void {
    $admin  = User::factory()->create()->assignRole('admin');
    $lesson = makeLesson();

    $this->actingAs($admin)
        ->putJson("/api/v1/lessons/{$lesson->id}", ['type' => 'code'])
        ->assertOk()
        ->assertJsonPath('data.type', 'code');
});

test('cannot update a cancelled lesson', function (): void {
    $admin  = User::factory()->create()->assignRole('admin');
    $lesson = makeLesson(['status' => 'cancelled']);

    $this->actingAs($admin)
        ->putJson("/api/v1/lessons/{$lesson->id}", ['type' => 'code'])
        ->assertForbidden();
});

// --- cancel ---

test('secretaire can cancel a lesson', function (): void {
    $secretaire = User::factory()->create()->assignRole('secretaire');
    $lesson     = makeLesson();

    $this->actingAs($secretaire)
        ->patchJson("/api/v1/lessons/{$lesson->id}/cancel", [
            'cancellation_reason' => 'Indisponibilité élève.',
        ])
        ->assertOk()
        ->assertJsonPath('data.status', 'cancelled')
        ->assertJsonPath('data.cancellation_reason', 'Indisponibilité élève.');
});

test('moniteur can cancel their own lesson', function (): void {
    $user       = User::factory()->create()->assignRole('moniteur');
    $instructor = Instructor::factory()->create(['user_id' => $user->id]);
    $student    = Student::factory()->create();

    $lesson = Lesson::factory()->create([
        'instructor_id' => $instructor->id,
        'student_id'    => $student->id,
        'starts_at'     => '2030-03-01 09:00:00',
        'ends_at'       => '2030-03-01 10:00:00',
    ]);

    $this->actingAs($user)
        ->patchJson("/api/v1/lessons/{$lesson->id}/cancel", [])
        ->assertOk()
        ->assertJsonPath('data.status', 'cancelled');
});

// --- complete ---

test('admin can mark a lesson as completed', function (): void {
    $admin  = User::factory()->create()->assignRole('admin');
    $lesson = makeLesson();

    $this->actingAs($admin)
        ->patchJson("/api/v1/lessons/{$lesson->id}/complete")
        ->assertOk()
        ->assertJsonPath('data.status', 'completed');
});

// --- no-show ---

test('admin can mark a lesson as no_show', function (): void {
    $admin  = User::factory()->create()->assignRole('admin');
    $lesson = makeLesson();

    $this->actingAs($admin)
        ->patchJson("/api/v1/lessons/{$lesson->id}/no-show")
        ->assertOk()
        ->assertJsonPath('data.status', 'no_show');
});

// --- destroy ---

test('admin can delete a lesson', function (): void {
    $admin  = User::factory()->create()->assignRole('admin');
    $lesson = makeLesson();

    $this->actingAs($admin)
        ->deleteJson("/api/v1/lessons/{$lesson->id}")
        ->assertNoContent();

    $this->assertSoftDeleted('lessons', ['id' => $lesson->id]);
});

test('secretaire cannot delete a lesson', function (): void {
    $secretaire = User::factory()->create()->assignRole('secretaire');
    $lesson     = makeLesson();

    $this->actingAs($secretaire)
        ->deleteJson("/api/v1/lessons/{$lesson->id}")
        ->assertForbidden();
});
