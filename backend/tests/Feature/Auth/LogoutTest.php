<?php

use App\Models\User;

test('un utilisateur authentifié peut se déconnecter', function () {
    $user = User::factory()->create(['is_active' => true]);
    $user->assignRole('eleve');

    $this->actingAs($user)
        ->postJson('/api/v1/auth/logout')
        ->assertOk()
        ->assertJsonFragment(['message' => 'Deconnexion reussie.']);
});

test('un utilisateur non authentifié reçoit 401 sur logout', function () {
    $this->postJson('/api/v1/auth/logout')
        ->assertUnauthorized()
        ->assertJsonFragment(['code' => 'UNAUTHENTICATED']);
});
