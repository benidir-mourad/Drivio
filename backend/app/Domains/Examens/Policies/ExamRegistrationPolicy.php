<?php

namespace App\Domains\Examens\Policies;

use App\Domains\Examens\Models\ExamRegistration;
use App\Models\User;

class ExamRegistrationPolicy
{
    public function viewAny(User $user): bool
    {
        return true; // Controller filters by role
    }

    public function view(User $user, ExamRegistration $exam): bool
    {
        if ($user->hasAnyRole(['admin', 'secretaire', 'moniteur'])) {
            return true;
        }

        // An eleve can only see their own exams
        return $user->hasRole('eleve') && $exam->student->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'secretaire']);
    }

    public function update(User $user, ExamRegistration $exam): bool
    {
        return $user->hasAnyRole(['admin', 'secretaire']);
    }

    public function recordResult(User $user, ExamRegistration $exam): bool
    {
        if (! in_array($exam->status, ['planned'], true)) {
            return false;
        }

        return $user->hasAnyRole(['admin', 'secretaire']);
    }

    public function delete(User $user, ExamRegistration $exam): bool
    {
        return $user->hasRole('admin');
    }
}
