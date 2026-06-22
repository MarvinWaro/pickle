<?php

namespace Database\Factories;

use App\Models\Court;
use App\Models\TimeSlot;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TimeSlot>
 */
class TimeSlotFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'court_id' => Court::factory(),
            'start_time' => '08:00',
            'end_time' => '09:00',
            'is_active' => true,
        ];
    }
}
