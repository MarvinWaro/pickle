<?php

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\Court;
use App\Models\TimeSlot;
use App\Models\User;

function bookingAdmin(): User
{
    return User::factory()->create(['role' => 'admin']);
}

function awaitingBooking(): Booking
{
    $court = Court::factory()->create();
    $slot = TimeSlot::factory()->for($court)->create();

    return Booking::factory()->hasAttached($slot)->create([
        'court_id' => $court->id,
        'status' => BookingStatus::AwaitingConfirmation,
    ]);
}

test('non-admins cannot view the bookings admin', function () {
    $this->actingAs(User::factory()->create(['role' => 'user']))
        ->get(route('admin.bookings.index'))
        ->assertForbidden();
});

test('an admin can view the bookings list', function () {
    awaitingBooking();

    $this->actingAs(bookingAdmin())
        ->get(route('admin.bookings.index'))
        ->assertOk();
});

test('an admin can confirm an awaiting booking', function () {
    $booking = awaitingBooking();

    $this->actingAs(bookingAdmin())
        ->post(route('admin.bookings.confirm', $booking))
        ->assertSessionHasNoErrors();

    $booking->refresh();

    expect($booking->status)->toBe(BookingStatus::Confirmed);
    expect($booking->confirmed_at)->not->toBeNull();
});

test('confirming a non-awaiting booking is a no-op', function () {
    $court = Court::factory()->create();
    $slot = TimeSlot::factory()->for($court)->create();
    $booking = Booking::factory()->hasAttached($slot)->create([
        'court_id' => $court->id,
        'status' => BookingStatus::PendingPayment,
    ]);

    $this->actingAs(bookingAdmin())
        ->post(route('admin.bookings.confirm', $booking));

    expect($booking->fresh()->status)->toBe(BookingStatus::PendingPayment);
});

test('rejecting a booking frees its slot', function () {
    $court = Court::factory()->create();
    $slot = TimeSlot::factory()->for($court)->create();
    $date = today()->addDay();

    $booking = Booking::factory()->hasAttached($slot)->create([
        'court_id' => $court->id,
        'booking_date' => $date,
        'status' => BookingStatus::AwaitingConfirmation,
    ]);

    $this->actingAs(bookingAdmin())
        ->post(route('admin.bookings.reject', $booking), ['reason' => 'No payment received'])
        ->assertSessionHasNoErrors();

    $booking->refresh();

    expect($booking->status)->toBe(BookingStatus::Rejected);
    expect($booking->notes)->toBe('No payment received');

    // The slot is no longer blocking, so it reads as free again.
    $stillBlocked = TimeSlot::where('id', $slot->id)
        ->whereHas('bookings', fn ($query) => $query
            ->whereDate('booking_date', $date)
            ->blocking())
        ->exists();

    expect($stillBlocked)->toBeFalse();
});

test('an admin can cancel a confirmed booking and free the slot', function () {
    $court = Court::factory()->create();
    $slot = TimeSlot::factory()->for($court)->create();
    $date = today()->addDay();

    $booking = Booking::factory()->hasAttached($slot)->create([
        'court_id' => $court->id,
        'booking_date' => $date,
        'status' => BookingStatus::Confirmed,
    ]);

    $this->actingAs(bookingAdmin())
        ->post(route('admin.bookings.cancel', $booking), ['reason' => 'Venue closed that day'])
        ->assertSessionHasNoErrors();

    expect($booking->fresh()->status)->toBe(BookingStatus::Cancelled);

    $stillBlocked = TimeSlot::where('id', $slot->id)
        ->whereHas('bookings', fn ($query) => $query
            ->whereDate('booking_date', $date)
            ->blocking())
        ->exists();

    expect($stillBlocked)->toBeFalse();
});

test('cancelling a pending booking is a no-op', function () {
    $court = Court::factory()->create();
    $slot = TimeSlot::factory()->for($court)->create();
    $booking = Booking::factory()->hasAttached($slot)->create([
        'court_id' => $court->id,
        'status' => BookingStatus::PendingPayment,
    ]);

    $this->actingAs(bookingAdmin())
        ->post(route('admin.bookings.cancel', $booking));

    expect($booking->fresh()->status)->toBe(BookingStatus::PendingPayment);
});

test('non-admins cannot confirm bookings', function () {
    $booking = awaitingBooking();

    $this->actingAs(User::factory()->create(['role' => 'user']))
        ->post(route('admin.bookings.confirm', $booking))
        ->assertForbidden();
});
