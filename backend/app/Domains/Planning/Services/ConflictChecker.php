<?php

namespace App\Domains\Planning\Services;

use App\Domains\Planning\Models\Lesson;
use Carbon\Carbon;

class ConflictChecker
{
    /**
     * Returns the list of resource types that have a scheduling conflict.
     *
     * @return list<string> e.g. ['instructor', 'vehicle', 'student']
     */
    public function check(
        int $instructorId,
        int $studentId,
        ?int $vehicleId,
        Carbon $startsAt,
        Carbon $endsAt,
        ?int $excludeLessonId = null
    ): array {
        // A conflict exists when two intervals overlap: A.start < B.end AND A.end > B.start
        $base = Lesson::query()
            ->whereNotIn('status', ['cancelled'])
            ->where('starts_at', '<', $endsAt)
            ->where('ends_at', '>', $startsAt)
            ->when($excludeLessonId, fn ($q) => $q->where('id', '!=', $excludeLessonId));

        $conflicts = [];

        if ($base->clone()->where('instructor_id', $instructorId)->exists()) {
            $conflicts[] = 'instructor';
        }

        if ($vehicleId !== null && $base->clone()->where('vehicle_id', $vehicleId)->exists()) {
            $conflicts[] = 'vehicle';
        }

        if ($base->clone()->where('student_id', $studentId)->exists()) {
            $conflicts[] = 'student';
        }

        return $conflicts;
    }
}
