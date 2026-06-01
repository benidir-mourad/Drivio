<?php

use App\Models\User;

test('un utilisateur actif peut se connecter avec des identifiants valides', function () {
    $user = User::factory()->create([
        'email'     => 'test@drivio.fr',
        'password'  => bcrypt('password123'),
        'is_active' => true,
    ]);
    $user->assignRole('eleve');

    $response = $this->postJson('/api/v1/auth/login', [
        'email'    => 'test@drivio.fr',
        'password' => 'password123',
    ]);

    $response->assertOk()
        ->assertJsonStructure(['data' => ['id', 'name', 'email', 'roles', 'is_active']]);
});

test('des identifiants incorrects retournent 401', function () {
    $response = $this->postJson('/api/v1/auth/login', [
        'email'    => 'inconnu@drivio.fr',
        'password' => 'mauvais_mdp',
    ]);

    $response->assertUnauthorized()
        ->assertJsonFragment(['code' => 'INVALID_CREDENTIALS']);
});

test('un compte désactivé retourne 403', function () {
    $user = User::factory()->create([
        'email'     => 'inactif@drivio.fr',
        'password'  => bcrypt('password'),
        'is_active' => false,
    ]);
    $user->assignRole('eleve');

    $response = $this->postJson('/api/v1/auth/login', [
        'email'    => 'inactif@drivio.fr',
        'password' => 'password',
    ]);

    $response->assertForbidden()
        ->assertJsonFragment(['code' => 'ACCOUNT_DISABLED']);
});

test('la validation échoue si email est absent', function () {
    $response = $this->postJson('/api/v1/auth/login', [
        'password' => 'password',
    ]);

    $response->assertUnprocessable()
        ->assertJsonFragment(['code' => 'VALIDATION_ERROR']);
});

test('la validation échoue si password est absent', function () {
    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'test@drivio.fr',
    ]);

    $response->assertUnprocessable()
        ->assertJsonFragment(['code' => 'VALIDATION_ERROR']);
});
