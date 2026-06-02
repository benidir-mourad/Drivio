<?php

namespace Database\Factories;

use App\Domains\Moniteurs\Models\Instructor;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Instructor> */
class InstructorFactory extends Factory
{
    protected $model = Instructor::class;

    public function definition(): array
    {
        return [
            'first_name'     => fake()->firstName(),
            'last_name'      => fake()->lastName(),
            'email'          => fake()->unique()->safeEmail(),
            'phone'          => fake()->optional()->phoneNumber(),
            'license_number' => fake()->optional()->bothify('BEPECASER-####'),
            'hire_date'      => fake()->boolean(70) ? fake()->dateTimeBetween('-10 years', 'now')->format('Y-m-d') : null,
            'status'         => fake()->randomElement(['active', 'inactive']),
            'notes'          => fake()->optional()->sentence(),
        ];
    }

    public function active(): static
    {
        return $this->state(['status' => 'active']);
    }
}
