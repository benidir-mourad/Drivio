<?php

use App\Domains\Vehicules\Models\Vehicle;
use App\Models\User;

// --- index ---

test('admin can list vehicles', function (): void {
    $admin = User::factory()->create()->assignRole('admin');
    Vehicle::factory()->count(3)->create();

    $this->actingAs($admin)
        ->getJson('/api/v1/vehicles')
        ->assertOk()
        ->assertJsonStructure(['data', 'meta']);
});

test('moniteur can list vehicles', function (): void {
    $moniteur = User::factory()->create()->assignRole('moniteur');

    $this->actingAs($moniteur)
        ->getJson('/api/v1/vehicles')
        ->assertOk();
});

test('eleve cannot list vehicles', function (): void {
    $eleve = User::factory()->create()->assignRole('eleve');

    $this->actingAs($eleve)
        ->getJson('/api/v1/vehicles')
        ->assertForbidden();
});

test('index supports search filter', function (): void {
    $admin = User::factory()->create()->assignRole('admin');
    Vehicle::factory()->create(['brand' => 'Peugeot', 'plate_number' => 'AA-001-AA']);
    Vehicle::factory()->create(['brand' => 'Renault', 'plate_number' => 'BB-002-BB']);

    $this->actingAs($admin)
        ->getJson('/api/v1/vehicles?search=Peugeot')
        ->assertOk()
        ->assertJsonCount(1, 'data');
});

test('index supports status filter', function (): void {
    $admin = User::factory()->create()->assignRole('admin');
    Vehicle::factory()->count(2)->create(['status' => 'available']);
    Vehicle::factory()->create(['status' => 'maintenance']);

    $this->actingAs($admin)
        ->getJson('/api/v1/vehicles?status=available')
        ->assertOk()
        ->assertJsonCount(2, 'data');
});

// --- show ---

test('admin can view a vehicle', function (): void {
    $admin   = User::factory()->create()->assignRole('admin');
    $vehicle = Vehicle::factory()->create();

    $this->actingAs($admin)
        ->getJson("/api/v1/vehicles/{$vehicle->id}")
        ->assertOk()
        ->assertJsonPath('data.id', $vehicle->id);
});

// --- store ---

test('admin can create a vehicle', function (): void {
    $admin = User::factory()->create()->assignRole('admin');

    $this->actingAs($admin)
        ->postJson('/api/v1/vehicles', [
            'plate_number'     => 'XX-123-XX',
            'brand'            => 'Peugeot',
            'model'            => '208',
            'year'             => 2023,
            'license_category' => 'B',
            'fuel_type'        => 'essence',
        ])
        ->assertCreated()
        ->assertJsonPath('data.plate_number', 'XX-123-XX');

    $this->assertDatabaseHas('vehicles', ['plate_number' => 'XX-123-XX']);
});

test('secretaire can create a vehicle', function (): void {
    $secretaire = User::factory()->create()->assignRole('secretaire');

    $this->actingAs($secretaire)
        ->postJson('/api/v1/vehicles', [
            'plate_number'     => 'YY-456-YY',
            'brand'            => 'Renault',
            'model'            => 'Clio',
            'year'             => 2022,
            'license_category' => 'B',
            'fuel_type'        => 'diesel',
        ])
        ->assertCreated();
});

test('moniteur cannot create a vehicle', function (): void {
    $moniteur = User::factory()->create()->assignRole('moniteur');

    $this->actingAs($moniteur)
        ->postJson('/api/v1/vehicles', [
            'plate_number'     => 'ZZ-789-ZZ',
            'brand'            => 'Toyota',
            'model'            => 'Yaris',
            'year'             => 2021,
            'license_category' => 'B',
            'fuel_type'        => 'hybride',
        ])
        ->assertForbidden();
});

test('store validates required fields', function (): void {
    $admin = User::factory()->create()->assignRole('admin');

    $this->actingAs($admin)
        ->postJson('/api/v1/vehicles', [])
        ->assertUnprocessable();
});

test('store rejects duplicate plate number', function (): void {
    $admin = User::factory()->create()->assignRole('admin');
    Vehicle::factory()->create(['plate_number' => 'DUP-001-AA']);

    $this->actingAs($admin)
        ->postJson('/api/v1/vehicles', [
            'plate_number'     => 'DUP-001-AA',
            'brand'            => 'Peugeot',
            'model'            => '208',
            'year'             => 2023,
            'license_category' => 'B',
            'fuel_type'        => 'essence',
        ])
        ->assertUnprocessable();
});

// --- update ---

test('admin can update a vehicle', function (): void {
    $admin   = User::factory()->create()->assignRole('admin');
    $vehicle = Vehicle::factory()->create(['status' => 'available']);

    $this->actingAs($admin)
        ->putJson("/api/v1/vehicles/{$vehicle->id}", ['status' => 'maintenance'])
        ->assertOk()
        ->assertJsonPath('data.status', 'maintenance');
});

// --- destroy ---

test('admin can delete a vehicle', function (): void {
    $admin   = User::factory()->create()->assignRole('admin');
    $vehicle = Vehicle::factory()->create();

    $this->actingAs($admin)
        ->deleteJson("/api/v1/vehicles/{$vehicle->id}")
        ->assertNoContent();

    $this->assertSoftDeleted('vehicles', ['id' => $vehicle->id]);
});

test('secretaire cannot delete a vehicle', function (): void {
    $secretaire = User::factory()->create()->assignRole('secretaire');
    $vehicle    = Vehicle::factory()->create();

    $this->actingAs($secretaire)
        ->deleteJson("/api/v1/vehicles/{$vehicle->id}")
        ->assertForbidden();
});
