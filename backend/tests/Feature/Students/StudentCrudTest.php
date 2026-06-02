<?php

use App\Domains\Eleves\Models\Student;
use App\Models\User;

// --- index ---

test('admin can list students', function (): void {
    $admin = User::factory()->create()->assignRole('admin');
    Student::factory()->count(3)->create();

    $this->actingAs($admin)
        ->getJson('/api/v1/students')
        ->assertOk()
        ->assertJsonStructure(['data', 'meta']);
});

test('eleve cannot list all students', function (): void {
    $eleve = User::factory()->create()->assignRole('eleve');
    Student::factory()->count(2)->create();

    $this->actingAs($eleve)
        ->getJson('/api/v1/students')
        ->assertForbidden();
});

test('unauthenticated request is rejected', function (): void {
    $this->getJson('/api/v1/students')->assertUnauthorized();
});

test('index supports search filter', function (): void {
    $admin = User::factory()->create()->assignRole('admin');
    Student::factory()->create(['first_name' => 'Alice', 'last_name' => 'Dupont']);
    Student::factory()->create(['first_name' => 'Bob', 'last_name' => 'Martin']);

    $this->actingAs($admin)
        ->getJson('/api/v1/students?search=Alice')
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

test('index supports status filter', function (): void {
    $admin = User::factory()->create()->assignRole('admin');
    Student::factory()->count(2)->create(['status' => 'active']);
    Student::factory()->create(['status' => 'graduated']);

    $this->actingAs($admin)
        ->getJson('/api/v1/students?status=active')
        ->assertOk()
        ->assertJsonCount(2, 'data');
});

// --- show ---

test('admin can view a student', function (): void {
    $admin   = User::factory()->create()->assignRole('admin');
    $student = Student::factory()->create();

    $this->actingAs($admin)
        ->getJson("/api/v1/students/{$student->id}")
        ->assertOk()
        ->assertJsonPath('data.id', $student->id);
});

test('eleve can view their own student record', function (): void {
    $user    = User::factory()->create()->assignRole('eleve');
    $student = Student::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->getJson("/api/v1/students/{$student->id}")
        ->assertOk();
});

test('eleve cannot view another student record', function (): void {
    $user  = User::factory()->create()->assignRole('eleve');
    $other = Student::factory()->create();

    $this->actingAs($user)
        ->getJson("/api/v1/students/{$other->id}")
        ->assertForbidden();
});

// --- store ---

test('admin can create a student', function (): void {
    $admin = User::factory()->create()->assignRole('admin');

    $this->actingAs($admin)
        ->postJson('/api/v1/students', [
            'first_name'       => 'Marie',
            'last_name'        => 'Curie',
            'email'            => 'marie.curie@example.com',
            'license_category' => 'B',
            'enrollment_date'  => '2026-01-15',
        ])
        ->assertCreated()
        ->assertJsonPath('data.email', 'marie.curie@example.com');

    $this->assertDatabaseHas('students', ['email' => 'marie.curie@example.com']);
});

test('secretaire can create a student', function (): void {
    $secretaire = User::factory()->create()->assignRole('secretaire');

    $this->actingAs($secretaire)
        ->postJson('/api/v1/students', [
            'first_name'       => 'Jean',
            'last_name'        => 'Valjean',
            'email'            => 'jean.valjean@example.com',
            'license_category' => 'B',
            'enrollment_date'  => '2026-01-15',
        ])
        ->assertCreated();
});

test('moniteur cannot create a student', function (): void {
    $moniteur = User::factory()->create()->assignRole('moniteur');

    $this->actingAs($moniteur)
        ->postJson('/api/v1/students', [
            'first_name'       => 'Test',
            'last_name'        => 'User',
            'email'            => 'test@example.com',
            'license_category' => 'B',
            'enrollment_date'  => '2026-01-15',
        ])
        ->assertForbidden();
});

test('store validates required fields', function (): void {
    $admin = User::factory()->create()->assignRole('admin');

    $this->actingAs($admin)
        ->postJson('/api/v1/students', [])
        ->assertUnprocessable()
        ->assertJsonFragment(['code' => 'VALIDATION_ERROR']);
});

test('store rejects duplicate email', function (): void {
    $admin = User::factory()->create()->assignRole('admin');
    Student::factory()->create(['email' => 'existing@example.com']);

    $this->actingAs($admin)
        ->postJson('/api/v1/students', [
            'first_name'       => 'New',
            'last_name'        => 'Student',
            'email'            => 'existing@example.com',
            'license_category' => 'B',
            'enrollment_date'  => '2026-01-15',
        ])
        ->assertUnprocessable();
});

// --- update ---

test('admin can update a student', function (): void {
    $admin   = User::factory()->create()->assignRole('admin');
    $student = Student::factory()->create(['status' => 'active']);

    $this->actingAs($admin)
        ->putJson("/api/v1/students/{$student->id}", ['status' => 'graduated'])
        ->assertOk()
        ->assertJsonPath('data.status', 'graduated');
});

test('moniteur cannot update a student', function (): void {
    $moniteur = User::factory()->create()->assignRole('moniteur');
    $student  = Student::factory()->create();

    $this->actingAs($moniteur)
        ->putJson("/api/v1/students/{$student->id}", ['status' => 'graduated'])
        ->assertForbidden();
});

// --- destroy ---

test('admin can delete a student', function (): void {
    $admin   = User::factory()->create()->assignRole('admin');
    $student = Student::factory()->create();

    $this->actingAs($admin)
        ->deleteJson("/api/v1/students/{$student->id}")
        ->assertNoContent();

    $this->assertSoftDeleted('students', ['id' => $student->id]);
});

test('secretaire cannot delete a student', function (): void {
    $secretaire = User::factory()->create()->assignRole('secretaire');
    $student    = Student::factory()->create();

    $this->actingAs($secretaire)
        ->deleteJson("/api/v1/students/{$student->id}")
        ->assertForbidden();
});
