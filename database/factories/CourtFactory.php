<?php

namespace Database\Factories;

use App\Models\Court;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Court>
 */
class CourtFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => 'Court '.fake()->unique()->randomLetter(),
            'description' => fake()->sentence(),
            'surface' => fake()->randomElement(['Indoor', 'Outdoor']),
            'image_path' => null,
            'price_per_hour' => fake()->randomFloat(2, 100, 500),
            'payment_qr_path' => null,
            'is_active' => true,
            'sort_order' => 0,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_active' => false,
        ]);
    }
}
