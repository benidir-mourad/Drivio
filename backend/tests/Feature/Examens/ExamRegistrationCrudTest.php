<?php

use App\Domains\Eleves\Models\Student;
use App\Domains\Examens\Models\ExamRegistration;
use App\Models\User;

function makeExam(array $overrides = []): ExamRegistration
{
    $student = Student::factory()->create();

    return ExamRegistration::factory()->create(array_merge([
        'student_id' => $student->id,
    ], $overrides));
}

function examPayload(array $overrides = []): array
{
    $student = Student::factory()->create();

    return array_merge([
        'student_id'     => $student->id,
        'type'           => 'theorique',
        'center'         => 'goca',
        'center_city'    => 'Namur',
        'scheduled_date' => '2030-09-15',
    ], $overrides);
}

// --- index ---

test('admin can list exam registrations', function (): void {
    $admin = User::factory()->create()->assignRole('admin');
    makeExam();

    $this->actingAs($admin)
        ->getJson('/api/v1/exam-registrations')
        ->assertOk()
        ->assertJsonStructure(['data', 'meta']);
});

test('unauthenticated request is rejected', function (): void {
    $this->getJson('/api/v1/exam-registrations')->assertUnauthorized();
});

test('eleve only sees their own exam registrations', function (): void {
    $user    = User::factory()->create()->assignRole('eleve');
    $student = Student::factory()->create(['user_id' => $user->id]);

    ExamRegistration::factory()->create(['student_id' => $student->id]);
    makeExam(); // another student

    $this->actingAs($user)
        ->getJson('/api/v1/exam-registrations')
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

test('index filters by student_id', function (): void {
    $admin   = User::factory()->create()->assignRole('admin');
    $student = Student::factory()->create();
    ExamRegistration::factory()->count(2)->create(['student_id' => $student->id]);
    makeExam();

    $this->actingAs($admin)
        ->getJson("/api/v1/exam-registrations?student_id={$student->id}")
        ->assertOk()
        ->assertJsonCount(2, 'data');
});

test('index filters by type', function (): void {
    $admin   = User::factory()->create()->assignRole('admin');
    $student = Student::factory()->create();
    ExamRegistration::factory()->theorique()->create(['student_id' => $student->id]);
    ExamRegistration::factory()->pratique()->create(['student_id' => $student->id]);

    $this->actingAs($admin)
        ->getJson('/api/v1/exam-registrations?type=theorique')
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

test('index filters by status', function (): void {
    $admin   = User::factory()->create()->assignRole('admin');
    $student = Student::factory()->create();
    ExamRegistration::factory()->passed()->create(['student_id' => $student->id]);
    ExamRegistration::factory()->failed()->create(['student_id' => $student->id]);
    ExamRegistration::factory()->create(['student_id' => $student->id]); // planned

    $this->actingAs($admin)
        ->getJson('/api/v1/exam-registrations?status=passed')
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

// --- show ---

test('admin can view an exam registration', function (): void {
    $admin = User::factory()->create()->assignRole('admin');
    $exam  = makeExam();

    $this->actingAs($admin)
        ->getJson("/api/v1/exam-registrations/{$exam->id}")
        ->assertOk()
        ->assertJsonPath('data.id', $exam->id)
        ->assertJsonStructure(['data' => ['student', 'type', 'center', 'status', 'is_theory']]);
});

test('eleve can view their own exam', function (): void {
    $user    = User::factory()->create()->assignRole('eleve');
    $student = Student::factory()->create(['user_id' => $user->id]);
    $exam    = ExamRegistration::factory()->create(['student_id' => $student->id]);

    $this->actingAs($user)
        ->getJson("/api/v1/exam-registrations/{$exam->id}")
        ->assertOk();
});

test('eleve cannot view another student exam', function (): void {
    $user = User::factory()->create()->assignRole('eleve');
    $exam = makeExam();

    $this->actingAs($user)
        ->getJson("/api/v1/exam-registrations/{$exam->id}")
        ->assertForbidden();
});

// --- store ---

test('admin can create an exam registration', function (): void {
    $admin   = User::factory()->create()->assignRole('admin');
    $payload = examPayload();

    $this->actingAs($admin)
        ->postJson('/api/v1/exam-registrations', $payload)
        ->assertCreated()
        ->assertJsonPath('data.type', 'theorique')
        ->assertJsonPath('data.status', 'planned')
        ->assertJsonPath('data.is_theory', true);
});

test('secretaire can create an exam registration', function (): void {
    $secretaire = User::factory()->create()->assignRole('secretaire');

    $this->actingAs($secretaire)
        ->postJson('/api/v1/exam-registrations', examPayload())
        ->assertCreated();
});

test('moniteur cannot create an exam registration', function (): void {
    $moniteur = User::factory()->create()->assignRole('moniteur');

    $this->actingAs($moniteur)
        ->postJson('/api/v1/exam-registrations', examPayload())
        ->assertForbidden();
});

test('store validates required fields', function (): void {
    $admin = User::factory()->create()->assignRole('admin');

    $this->actingAs($admin)
        ->postJson('/api/v1/exam-registrations', [])
        ->assertUnprocessable();
});

test('pratique exam is_theory is false', function (): void {
    $admin = User::factory()->create()->assignRole('admin');

    $this->actingAs($admin)
        ->postJson('/api/v1/exam-registrations', examPayload(['type' => 'pratique']))
        ->assertCreated()
        ->assertJsonPath('data.is_theory', false);
});

// --- update ---

test('admin can update an exam registration', function (): void {
    $admin = User::factory()->create()->assignRole('admin');
    $exam  = makeExam();

    $this->actingAs($admin)
        ->putJson("/api/v1/exam-registrations/{$exam->id}", [
            'center_city' => 'Liège',
        ])
        ->assertOk()
        ->assertJsonPath('data.center_city', 'Liège');
});

// --- record result ---

test('admin can record a pass result with score for theory exam', function (): void {
    $admin = User::factory()->create()->assignRole('admin');
    $exam  = makeExam(['type' => 'theorique']);

    $this->actingAs($admin)
        ->patchJson("/api/v1/exam-registrations/{$exam->id}/result", [
            'status' => 'passed',
            'score'  => 44.5,
        ])
        ->assertOk()
        ->assertJsonPath('data.status', 'passed')
        ->assertJsonPath('data.score', 44.5);
});

test('admin can record a fail result', function (): void {
    $admin = User::factory()->create()->assignRole('admin');
    $exam  = makeExam(['type' => 'theorique']);

    $this->actingAs($admin)
        ->patchJson("/api/v1/exam-registrations/{$exam->id}/result", [
            'status' => 'failed',
            'score'  => 35.0,
        ])
        ->assertOk()
        ->assertJsonPath('data.status', 'failed');
});

test('cannot record result for already-passed exam', function (): void {
    $admin = User::factory()->create()->assignRole('admin');
    $exam  = makeExam(['status' => 'passed']);

    $this->actingAs($admin)
        ->patchJson("/api/v1/exam-registrations/{$exam->id}/result", [
            'status' => 'failed',
        ])
        ->assertForbidden();
});

test('score must not exceed 50', function (): void {
    $admin = User::factory()->create()->assignRole('admin');
    $exam  = makeExam(['type' => 'theorique']);

    $this->actingAs($admin)
        ->patchJson("/api/v1/exam-registrations/{$exam->id}/result", [
            'status' => 'passed',
            'score'  => 51,
        ])
        ->assertUnprocessable();
});

test('admin can record absent', function (): void {
    $admin = User::factory()->create()->assignRole('admin');
    $exam  = makeExam();

    $this->actingAs($admin)
        ->patchJson("/api/v1/exam-registrations/{$exam->id}/result", ['status' => 'absent'])
        ->assertOk()
        ->assertJsonPath('data.status', 'absent');
});

// --- stats ---

test('admin can access stats endpoint', function (): void {
    $admin   = User::factory()->create()->assignRole('admin');
    $student = Student::factory()->create();

    ExamRegistration::factory()->passed()->create(['student_id' => $student->id, 'type' => 'theorique', 'scheduled_date' => '2030-01-10']);
    ExamRegistration::factory()->failed()->create(['student_id' => $student->id, 'type' => 'theorique', 'scheduled_date' => '2030-01-20']);

    $response = $this->actingAs($admin)
        ->getJson('/api/v1/exam-registrations/stats?year=2030')
        ->assertOk();

    expect($response->json('data.theorique.total'))->toBe(2)
        ->and($response->json('data.theorique.passed'))->toBe(1)
        ->and($response->json('data.theorique.rate'))->toBe(50);
});

// --- destroy ---

test('admin can delete an exam registration', function (): void {
    $admin = User::factory()->create()->assignRole('admin');
    $exam  = makeExam();

    $this->actingAs($admin)
        ->deleteJson("/api/v1/exam-registrations/{$exam->id}")
        ->assertNoContent();

    $this->assertSoftDeleted('exam_registrations', ['id' => $exam->id]);
});

test('secretaire cannot delete an exam registration', function (): void {
    $secretaire = User::factory()->create()->assignRole('secretaire');
    $exam       = makeExam();

    $this->actingAs($secretaire)
        ->deleteJson("/api/v1/exam-registrations/{$exam->id}")
        ->assertForbidden();
});

// --- reexamen types ---

test('reexamen_theorique is stored and identified as theory', function (): void {
    $admin = User::factory()->create()->assignRole('admin');

    $this->actingAs($admin)
        ->postJson('/api/v1/exam-registrations', examPayload(['type' => 'reexamen_theorique']))
        ->assertCreated()
        ->assertJsonPath('data.type', 'reexamen_theorique')
        ->assertJsonPath('data.is_theory', true);
});

test('reexamen_pratique is stored and not identified as theory', function (): void {
    $admin = User::factory()->create()->assignRole('admin');

    $this->actingAs($admin)
        ->postJson('/api/v1/exam-registrations', examPayload(['type' => 'reexamen_pratique']))
        ->assertCreated()
        ->assertJsonPath('data.is_theory', false);
});

// --- date filters ---

test('index filters by date_from', function (): void {
    $admin   = User::factory()->create()->assignRole('admin');
    $student = Student::factory()->create();

    ExamRegistration::factory()->create(['student_id' => $student->id, 'scheduled_date' => '2030-03-01']);
    ExamRegistration::factory()->create(['student_id' => $student->id, 'scheduled_date' => '2030-04-15']);

    $this->actingAs($admin)
        ->getJson('/api/v1/exam-registrations?date_from=2030-04-01')
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

test('index filters by date_to', function (): void {
    $admin   = User::factory()->create()->assignRole('admin');
    $student = Student::factory()->create();

    ExamRegistration::factory()->create(['student_id' => $student->id, 'scheduled_date' => '2030-03-01']);
    ExamRegistration::factory()->create(['student_id' => $student->id, 'scheduled_date' => '2030-04-15']);

    $this->actingAs($admin)
        ->getJson('/api/v1/exam-registrations?date_to=2030-03-31')
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

// --- moniteur role ---

test('moniteur can list exam registrations', function (): void {
    $moniteur = User::factory()->create()->assignRole('moniteur');
    makeExam();

    $this->actingAs($moniteur)
        ->getJson('/api/v1/exam-registrations')
        ->assertOk();
});

test('moniteur can view any exam registration', function (): void {
    $moniteur = User::factory()->create()->assignRole('moniteur');
    $exam     = makeExam();

    $this->actingAs($moniteur)
        ->getJson("/api/v1/exam-registrations/{$exam->id}")
        ->assertOk();
});

// --- cancelled result ---

test('admin can record a cancelled result', function (): void {
    $admin = User::factory()->create()->assignRole('admin');
    $exam  = makeExam();

    $this->actingAs($admin)
        ->patchJson("/api/v1/exam-registrations/{$exam->id}/result", ['status' => 'cancelled'])
        ->assertOk()
        ->assertJsonPath('data.status', 'cancelled')
        ->assertJsonPath('data.score', null);
});

// --- stats edge cases ---

test('stats returns zero counts for types with no data', function (): void {
    $admin = User::factory()->create()->assignRole('admin');

    $response = $this->actingAs($admin)
        ->getJson('/api/v1/exam-registrations/stats?year=2099')
        ->assertOk();

    expect($response->json('data.theorique.total'))->toBe(0)
        ->and($response->json('data.theorique.rate'))->toBeNull();
});

test('stats includes reexamen types', function (): void {
    $admin   = User::factory()->create()->assignRole('admin');
    $student = Student::factory()->create();

    ExamRegistration::factory()->passed()->create([
        'student_id'     => $student->id,
        'type'           => 'reexamen_theorique',
        'scheduled_date' => '2030-11-10',
    ]);

    $response = $this->actingAs($admin)
        ->getJson('/api/v1/exam-registrations/stats?year=2030')
        ->assertOk();

    expect($response->json('data.reexamen_theorique.passed'))->toBe(1)
        ->and($response->json('data.reexamen_theorique.rate'))->toBe(100);
});
