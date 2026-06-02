<?php

namespace App\Domains\Eleves\Policies;

use App\Domains\Eleves\Models\Student;
use App\Models\User;

class StudentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'secretaire', 'moniteur']);
    }

    public function view(User $user, Student $student): bool
    {
        if ($user->hasAnyRole(['admin', 'secretaire', 'moniteur'])) {
            return true;
        }

        // An eleve can only view their own record
        return $user->hasRole('eleve') && $student->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'secretaire']);
    }

    public function update(User $user, Student $student): bool
    {
        return $user->hasAnyRole(['admin', 'secretaire']);
    }

    public function delete(User $user, Student $student): bool
    {
        return $user->hasRole('admin');
    }

    public function uploadDocument(User $user, Student $student): bool
    {
        return $user->hasAnyRole(['admin', 'secretaire']);
    }
}
