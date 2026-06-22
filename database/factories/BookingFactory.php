<?php

namespace Database\Factories;

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\Court;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Booking>
 */
class BookingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'court_id' => Court::factory(),
            'booking_date' => today()->addDay(),
            'status' => BookingStatus::PendingPayment,
            'amount' => fake()->randomFloat(2, 100, 500),
            'reference_code' => 'PB-'.strtoupper(Str::random(6)),
            'expires_at' => now()->addMinutes(5),
        ];
    }
}
