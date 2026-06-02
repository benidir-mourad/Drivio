<?php

namespace App\Domains\Moniteurs\Policies;

use App\Domains\Moniteurs\Models\Instructor;
use App\Models\User;

class InstructorPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'secretaire', 'moniteur']);
    }

    public function view(User $user, Instructor $instructor): bool
    {
        if ($user->hasAnyRole(['admin', 'secretaire'])) {
            return true;
        }

        // A moniteur can only view their own record
        return $user->hasRole('moniteur') && $instructor->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'secretaire']);
    }

    public function update(User $user, Instructor $instructor): bool
    {
        return $user->hasAnyRole(['admin', 'secretaire']);
    }

    public function delete(User $user, Instructor $instructor): bool
    {
        return $user->hasRole('admin');
    }
}
