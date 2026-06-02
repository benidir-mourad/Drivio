<?php

namespace Database\Factories;

use App\Domains\Eleves\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Student> */
class StudentFactory extends Factory
{
    protected $model = Student::class;

    public function definition(): array
    {
        return [
            'first_name'       => fake()->firstName(),
            'last_name'        => fake()->lastName(),
            'email'            => fake()->unique()->safeEmail(),
            'phone'            => fake()->optional()->phoneNumber(),
            'address'          => fake()->optional()->address(),
            'date_of_birth'    => fake()->dateTimeBetween('-40 years', '-18 years')->format('Y-m-d'),
            'license_category' => fake()->randomElement(['A', 'A1', 'A2', 'AM', 'B', 'B1', 'BE', 'C', 'CE', 'D']),
            'enrollment_date'  => fake()->dateTimeBetween('-2 years', 'now')->format('Y-m-d'),
            'status'           => fake()->randomElement(['active', 'suspended', 'graduated']),
            'notes'            => fake()->optional()->sentence(),
        ];
    }

    public function active(): static
    {
        return $this->state(['status' => 'active']);
    }
}
