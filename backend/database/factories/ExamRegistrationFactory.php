<?php

namespace Database\Factories;

use App\Domains\Examens\Models\ExamRegistration;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ExamRegistration> */
class ExamRegistrationFactory extends Factory
{
    protected $model = ExamRegistration::class;

    public function definition(): array
    {
        return [
            'type'           => fake()->randomElement(['theorique', 'pratique', 'reexamen_theorique', 'reexamen_pratique']),
            'center'         => fake()->randomElement(['goca', 'autosecure', 'car', 'other']),
            'center_city'    => fake()->randomElement(['Bruxelles', 'Liège', 'Namur', 'Mons', 'Charleroi', 'Bruges']),
            'scheduled_date' => fake()->dateTimeBetween('+1 week', '+3 months')->format('Y-m-d'),
            'registered_at'  => fake()->boolean(70) ? fake()->dateTimeBetween('-1 month', 'now')->format('Y-m-d') : null,
            'status'         => 'planned',
            'score'          => null,
            'notes'          => fake()->optional()->sentence(),
        ];
    }

    public function theorique(): static
    {
        return $this->state(['type' => 'theorique']);
    }

    public function pratique(): static
    {
        return $this->state(['type' => 'pratique']);
    }

    public function passed(?float $score = null): static
    {
        return $this->state(fn (array $attrs) => [
            'status' => 'passed',
            'score'  => in_array($attrs['type'], ['theorique', 'reexamen_theorique'], true)
                ? ($score ?? fake()->randomFloat(1, 41, 50))
                : null,
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn (array $attrs) => [
            'status' => 'failed',
            'score'  => in_array($attrs['type'], ['theorique', 'reexamen_theorique'], true)
                ? fake()->randomFloat(1, 20, 40)
                : null,
        ]);
    }
}
