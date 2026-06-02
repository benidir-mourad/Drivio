<?php

namespace Database\Factories;

use App\Domains\Planning\Models\Lesson;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Lesson> */
class LessonFactory extends Factory
{
    protected $model = Lesson::class;

    public function definition(): array
    {
        $startsAt = fake()->dateTimeBetween('+1 day', '+30 days');
        // Round to nearest 30min for realism
        $minutes = (int) $startsAt->format('i') < 30 ? 0 : 30;
        $startsAt->setTime((int) $startsAt->format('H'), $minutes, 0);
        $endsAt = (clone $startsAt)->modify('+1 hour');

        return [
            'type'      => fake()->randomElement(['conduite', 'code', 'accompagnement', 'bilan', 'examen_blanc']),
            'starts_at' => $startsAt,
            'ends_at'   => $endsAt,
            'status'    => 'scheduled',
            'notes'     => fake()->optional()->sentence(),
        ];
    }

    public function scheduled(): static
    {
        return $this->state(['status' => 'scheduled']);
    }

    public function completed(): static
    {
        return $this->state(['status' => 'completed']);
    }

    public function cancelled(): static
    {
        return $this->state([
            'status'              => 'cancelled',
            'cancellation_reason' => fake()->sentence(),
        ]);
    }
}
