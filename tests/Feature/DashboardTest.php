<?php

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\Court;
use App\Models\TimeSlot;
use App\Models\User;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->get(route('dashboard'));
    $response->assertOk();
});

test('the dashboard reports a user booking stats', function () {
    $user = User::factory()->create();
    $court = Court::factory()->create(['price_per_hour' => 200]);
    $slot = TimeSlot::factory()->for($court)->create();

    Booking::factory()->hasAttached($slot)->create([
        'user_id' => $user->id,
        'court_id' => $court->id,
        'status' => BookingStatus::Confirmed,
        'amount' => 200,
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->where('playerStats.sessions', 1)
            ->where('playerStats.days_played', 1)
            ->has('bookings', 1)
        );
});

test('an admin sees admin dashboard counts', function () {
    $admin = User::factory()->create(['role' => 'admin']);

    $this->actingAs($admin)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->has('admin')
            ->where('playerStats', null)
        );
});
