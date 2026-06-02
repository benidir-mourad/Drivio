<?php

use App\Domains\Moniteurs\Models\Instructor;
use App\Models\User;

// --- index ---

test('admin can list instructors', function (): void {
    $admin = User::factory()->create()->assignRole('admin');
    Instructor::factory()->count(3)->create();

    $this->actingAs($admin)
        ->getJson('/api/v1/instructors')
        ->assertOk()
        ->assertJsonStructure(['data', 'meta']);
});

test('moniteur can list instructors', function (): void {
    $moniteur = User::factory()->create()->assignRole('moniteur');

    $this->actingAs($moniteur)
        ->getJson('/api/v1/instructors')
        ->assertOk();
});

test('eleve cannot list instructors', function (): void {
    $eleve = User::factory()->create()->assignRole('eleve');

    $this->actingAs($eleve)
        ->getJson('/api/v1/instructors')
        ->assertForbidden();
});

test('index supports search filter', function (): void {
    $admin = User::factory()->create()->assignRole('admin');
    Instructor::factory()->create(['first_name' => 'Paul', 'last_name' => 'Dupont']);
    Instructor::factory()->create(['first_name' => 'Marc', 'last_name' => 'Martin']);

    $this->actingAs($admin)
        ->getJson('/api/v1/instructors?search=Paul')
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

// --- show ---

test('admin can view an instructor', function (): void {
    $admin      = User::factory()->create()->assignRole('admin');
    $instructor = Instructor::factory()->create();

    $this->actingAs($admin)
        ->getJson("/api/v1/instructors/{$instructor->id}")
        ->assertOk()
        ->assertJsonPath('data.id', $instructor->id);
});

test('moniteur can view their own instructor record', function (): void {
    $user       = User::factory()->create()->assignRole('moniteur');
    $instructor = Instructor::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user)
        ->getJson("/api/v1/instructors/{$instructor->id}")
        ->assertOk();
});

test('moniteur cannot view another instructor record', function (): void {
    $user  = User::factory()->create()->assignRole('moniteur');
    $other = Instructor::factory()->create();

    $this->actingAs($user)
        ->getJson("/api/v1/instructors/{$other->id}")
        ->assertForbidden();
});

// --- store ---

test('admin can create an instructor', function (): void {
    $admin = User::factory()->create()->assignRole('admin');

    $this->actingAs($admin)
        ->postJson('/api/v1/instructors', [
            'first_name' => 'Henri',
            'last_name'  => 'Leclerc',
            'email'      => 'henri.leclerc@example.com',
        ])
        ->assertCreated()
        ->assertJsonPath('data.email', 'henri.leclerc@example.com');
});

test('moniteur cannot create an instructor', function (): void {
    $moniteur = User::factory()->create()->assignRole('moniteur');

    $this->actingAs($moniteur)
        ->postJson('/api/v1/instructors', [
            'first_name' => 'Test',
            'last_name'  => 'User',
            'email'      => 'test@example.com',
        ])
        ->assertForbidden();
});

test('store validates required fields', function (): void {
    $admin = User::factory()->create()->assignRole('admin');

    $this->actingAs($admin)
        ->postJson('/api/v1/instructors', [])
        ->assertUnprocessable();
});

// --- update ---

test('admin can update an instructor', function (): void {
    $admin      = User::factory()->create()->assignRole('admin');
    $instructor = Instructor::factory()->create(['status' => 'active']);

    $this->actingAs($admin)
        ->putJson("/api/v1/instructors/{$instructor->id}", ['status' => 'inactive'])
        ->assertOk()
        ->assertJsonPath('data.status', 'inactive');
});

// --- destroy ---

test('admin can delete an instructor', function (): void {
    $admin      = User::factory()->create()->assignRole('admin');
    $instructor = Instructor::factory()->create();

    $this->actingAs($admin)
        ->deleteJson("/api/v1/instructors/{$instructor->id}")
        ->assertNoContent();

    $this->assertSoftDeleted('instructors', ['id' => $instructor->id]);
});

test('secretaire cannot delete an instructor', function (): void {
    $secretaire = User::factory()->create()->assignRole('secretaire');
    $instructor = Instructor::factory()->create();

    $this->actingAs($secretaire)
        ->deleteJson("/api/v1/instructors/{$instructor->id}")
        ->assertForbidden();
});
