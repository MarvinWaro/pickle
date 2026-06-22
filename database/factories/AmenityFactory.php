<?php

namespace Database\Factories;

use App\Models\Amenity;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Amenity>
 */
class AmenityFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->randomElement([
                'Showers', 'Locker Rooms', 'Parking', 'Pro Shop',
                'Restrooms', 'Water Station', 'Seating Area', 'Air Conditioning',
                'Lighting', 'Equipment Rental',
            ]),
        ];
    }
}
