<?php

namespace App\Domains\Planning\Policies;

use App\Domains\Planning\Models\Lesson;
use App\Models\User;

class LessonPolicy
{
    public function viewAny(User $user): bool
    {
        return true; // Controller filters by role
    }

    public function view(User $user, Lesson $lesson): bool
    {
        if ($user->hasAnyRole(['admin', 'secretaire'])) {
            return true;
        }

        if ($user->hasRole('moniteur')) {
            return $lesson->instructor->user_id === $user->id;
        }

        if ($user->hasRole('eleve')) {
            return $lesson->student->user_id === $user->id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'secretaire']);
    }

    public function update(User $user, Lesson $lesson): bool
    {
        if ($lesson->status !== 'scheduled') {
            return false;
        }

        return $user->hasAnyRole(['admin', 'secretaire']);
    }

    public function delete(User $user, Lesson $lesson): bool
    {
        return $user->hasRole('admin');
    }

    public function cancel(User $user, Lesson $lesson): bool
    {
        if ($lesson->status !== 'scheduled') {
            return false;
        }

        if ($user->hasAnyRole(['admin', 'secretaire'])) {
            return true;
        }

        // A moniteur can cancel their own lessons
        if ($user->hasRole('moniteur')) {
            return $lesson->instructor->user_id === $user->id;
        }

        return false;
    }

    public function complete(User $user, Lesson $lesson): bool
    {
        if ($lesson->status !== 'scheduled') {
            return false;
        }

        if ($user->hasAnyRole(['admin', 'secretaire'])) {
            return true;
        }

        // A moniteur can mark their own lessons as completed
        if ($user->hasRole('moniteur')) {
            return $lesson->instructor->user_id === $user->id;
        }

        return false;
    }

    public function markNoShow(User $user, Lesson $lesson): bool
    {
        if ($lesson->status !== 'scheduled') {
            return false;
        }

        return $user->hasAnyRole(['admin', 'secretaire', 'moniteur']);
    }
}
