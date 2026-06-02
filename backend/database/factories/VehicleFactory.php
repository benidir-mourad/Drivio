<?php

namespace Database\Factories;

use App\Domains\Vehicules\Models\Vehicle;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Vehicle> */
class VehicleFactory extends Factory
{
    protected $model = Vehicle::class;

    public function definition(): array
    {
        return [
            'plate_number'     => strtoupper(fake()->unique()->bothify('??-###-??')),
            'brand'            => fake()->randomElement(['Peugeot', 'Renault', 'Citroën', 'Volkswagen', 'Toyota']),
            'model'            => fake()->randomElement(['208', 'Clio', 'C3', 'Golf', 'Yaris']),
            'year'             => fake()->numberBetween(2015, 2025),
            'license_category' => fake()->randomElement(['A', 'A1', 'A2', 'AM', 'B', 'B1', 'C', 'D']),
            'fuel_type'        => fake()->randomElement(['essence', 'diesel', 'electrique', 'hybride']),
            'status'           => fake()->randomElement(['available', 'maintenance', 'retired']),
            'mileage'          => fake()->optional()->numberBetween(0, 200000),
            'notes'            => fake()->optional()->sentence(),
        ];
    }

    public function available(): static
    {
        return $this->state(['status' => 'available']);
    }
}
