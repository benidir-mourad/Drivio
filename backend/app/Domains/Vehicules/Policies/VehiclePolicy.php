<?php

namespace App\Domains\Vehicules\Policies;

use App\Domains\Vehicules\Models\Vehicle;
use App\Models\User;

class VehiclePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'secretaire', 'moniteur']);
    }

    public function view(User $user, Vehicle $vehicle): bool
    {
        return $user->hasAnyRole(['admin', 'secretaire', 'moniteur']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'secretaire']);
    }

    public function update(User $user, Vehicle $vehicle): bool
    {
        return $user->hasAnyRole(['admin', 'secretaire']);
    }

    public function delete(User $user, Vehicle $vehicle): bool
    {
        return $user->hasRole('admin');
    }
}
