<?php

use App\Models\User;

test('un utilisateur authentifié peut récupérer son profil', function () {
    $user = User::factory()->create(['is_active' => true]);
    $user->assignRole('moniteur');

    $this->actingAs($user)
        ->getJson('/api/v1/auth/me')
        ->assertOk()
        ->assertJsonStructure(['data' => ['id', 'name', 'email', 'roles', 'is_active']])
        ->assertJsonFragment(['email' => $user->email]);
});

test('un utilisateur non authentifié reçoit 401 sur me', function () {
    $this->getJson('/api/v1/auth/me')
        ->assertUnauthorized()
        ->assertJsonFragment(['code' => 'UNAUTHENTICATED']);
});
