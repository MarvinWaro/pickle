<?php

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\ClosedDate;
use App\Models\Court;
use App\Models\TimeSlot;
use App\Models\User;

test('non-admins cannot manage closed dates', function () {
    $this->actingAs(User::factory()->create(['role' => 'user']))
        ->get(route('settings.schedule.edit'))
        ->assertForbidden();
});

test('an admin can view the closed dates page', function () {
    $this->actingAs(User::factory()->create(['role' => 'admin']))
        ->get(route('settings.schedule.edit'))
        ->assertOk();
});

test('an admin can close and reopen a date', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $date = today()->addDays(3)->toDateString();

    $this->actingAs($admin)
        ->post(route('settings.schedule.store'), ['date' => $date, 'reason' => 'Holiday'])
        ->assertSessionHasNoErrors();

    $closed = ClosedDate::whereDate('date', $date)->first();

    expect($closed)->not->toBeNull();
    expect($closed->reason)->toBe('Holiday');

    $this->actingAs($admin)
        ->delete(route('settings.schedule.destroy', $closed))
        ->assertSessionHasNoErrors();

    expect(ClosedDate::find($closed->id))->toBeNull();
});

test('a closed date cannot be in the past', function () {
    $this->actingAs(User::factory()->create(['role' => 'admin']))
        ->from(route('settings.schedule.edit'))
        ->post(route('settings.schedule.store'), [
            'date' => today()->subDay()->toDateString(),
        ])
        ->assertSessionHasErrors('date');
});

test('closing a date keeps existing bookings on it intact', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $court = Court::factory()->create();
    $slot = TimeSlot::factory()->for($court)->create();
    $date = today()->addDays(2);

    $booking = Booking::factory()->hasAttached($slot)->create([
        'court_id' => $court->id,
        'booking_date' => $date,
        'status' => BookingStatus::Confirmed,
    ]);

    $this->actingAs($admin)
        ->post(route('settings.schedule.store'), ['date' => $date->toDateString()])
        ->assertSessionHasNoErrors();

    expect($booking->fresh()->status)->toBe(BookingStatus::Confirmed);
});

test('closing an already-closed date is idempotent', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $date = today()->addDays(2)->toDateString();

    $this->actingAs($admin)->post(route('settings.schedule.store'), ['date' => $date]);
    $this->actingAs($admin)->post(route('settings.schedule.store'), ['date' => $date]);

    expect(ClosedDate::whereDate('date', $date)->count())->toBe(1);
});
