<?php

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\ClosedDate;
use App\Models\Court;
use App\Models\Setting;
use App\Models\TimeSlot;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    Setting::create(['key' => 'hold_minutes', 'value' => '5']);
});

function bookableCourt(): Court
{
    return Court::factory()->create(['price_per_hour' => 200]);
}

test('the public court page lists available slots', function () {
    $court = bookableCourt();
    TimeSlot::factory()->for($court)->create(['start_time' => '08:00', 'end_time' => '09:00']);

    $this->get(route('courts.show', $court))->assertOk();
});

test('an inactive court is not publicly viewable', function () {
    $court = Court::factory()->create(['is_active' => false]);

    $this->get(route('courts.show', $court))->assertNotFound();
});

test('a guest can book with name and phone', function () {
    $court = bookableCourt();
    $slot = TimeSlot::factory()->for($court)->create();

    $this->post(route('bookings.store'), [
        'court_id' => $court->id,
        'time_slot_ids' => [$slot->id],
        'booking_date' => today()->addDay()->toDateString(),
        'guest_name' => 'Walk In',
        'guest_phone' => '09171234567',
    ])->assertSessionHasNoErrors();

    $booking = Booking::firstWhere('court_id', $court->id);

    expect($booking->user_id)->toBeNull();
    expect($booking->guest_name)->toBe('Walk In');
    expect($booking->customer_name)->toBe('Walk In');
});

test('a guest booking requires name and phone', function () {
    $court = bookableCourt();
    $slot = TimeSlot::factory()->for($court)->create();

    $this->from(route('courts.show', $court))
        ->post(route('bookings.store'), [
            'court_id' => $court->id,
            'time_slot_ids' => [$slot->id],
            'booking_date' => today()->addDay()->toDateString(),
        ])
        ->assertSessionHasErrors(['guest_name', 'guest_phone']);
});

test('find my booking redirects a valid reference to the pay page', function () {
    $court = bookableCourt();
    $slot = TimeSlot::factory()->for($court)->create();
    $booking = Booking::factory()->hasAttached($slot)->create([
        'user_id' => null,
        'court_id' => $court->id,
    ]);

    $this->post(route('bookings.lookup'), [
        'reference_code' => strtolower($booking->reference_code),
    ])->assertRedirect(route('bookings.pay', $booking->reference_code));
});

test('find my booking rejects an unknown reference', function () {
    $this->from(route('bookings.find'))
        ->post(route('bookings.lookup'), ['reference_code' => 'PB-NOPE00'])
        ->assertSessionHasErrors('reference_code');
});

test('the booking page shows the cancellation reason to the booker', function () {
    $court = bookableCourt();
    $slot = TimeSlot::factory()->for($court)->create();

    $booking = Booking::factory()->hasAttached($slot)->create([
        'user_id' => null,
        'court_id' => $court->id,
        'status' => BookingStatus::Cancelled,
        'notes' => 'Venue closed for maintenance',
    ]);

    $this->get(route('bookings.pay', $booking->reference_code))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('booking.status', 'cancelled')
            ->where('booking.notes', 'Venue closed for maintenance'));
});

test('a guest can view their booking pay page by reference', function () {
    $court = bookableCourt();
    $slot = TimeSlot::factory()->for($court)->create();

    $booking = Booking::factory()->hasAttached($slot)->create([
        'user_id' => null,
        'guest_name' => 'Walk In',
        'court_id' => $court->id,
    ]);

    $this->get(route('bookings.pay', $booking->reference_code))->assertOk();
});

test('an authenticated user can book multiple slots in one booking', function () {
    $court = bookableCourt();
    $slotA = TimeSlot::factory()->for($court)->create(['start_time' => '08:00', 'end_time' => '09:00']);
    $slotB = TimeSlot::factory()->for($court)->create(['start_time' => '09:00', 'end_time' => '10:00']);
    $date = today()->addDay()->toDateString();

    $this->actingAs(User::factory()->create())
        ->post(route('bookings.store'), [
            'court_id' => $court->id,
            'time_slot_ids' => [$slotA->id, $slotB->id],
            'booking_date' => $date,
        ])
        ->assertSessionHasNoErrors();

    $booking = Booking::firstWhere('court_id', $court->id);

    expect($booking->status)->toBe(BookingStatus::PendingPayment);
    expect($booking->timeSlots)->toHaveCount(2);
    expect($booking->amount)->toBe('400.00');
    expect($booking->reference_code)->toStartWith('PB-');
});

test('the booking total reflects per-slot evening pricing', function () {
    $court = bookableCourt(); // base rate 200
    $day = TimeSlot::factory()->for($court)->create([
        'start_time' => '08:00',
        'end_time' => '09:00',
        'price_per_hour' => null,
    ]);
    $evening = TimeSlot::factory()->for($court)->create([
        'start_time' => '18:00',
        'end_time' => '19:00',
        'price_per_hour' => 300,
    ]);
    $date = today()->addDay()->toDateString();

    $this->actingAs(User::factory()->create())
        ->post(route('bookings.store'), [
            'court_id' => $court->id,
            'time_slot_ids' => [$day->id, $evening->id],
            'booking_date' => $date,
        ])
        ->assertSessionHasNoErrors();

    // 200 (day) + 300 (evening) = 500
    expect(Booking::firstWhere('court_id', $court->id)->amount)->toBe('500.00');
});

test('bookings are blocked on a closed date', function () {
    $court = bookableCourt();
    $slot = TimeSlot::factory()->for($court)->create();
    $date = today()->addDay()->toDateString();
    ClosedDate::create(['date' => $date, 'reason' => 'Holiday']);

    $this->actingAs(User::factory()->create())
        ->from(route('courts.show', $court))
        ->post(route('bookings.store'), [
            'court_id' => $court->id,
            'time_slot_ids' => [$slot->id],
            'booking_date' => $date,
        ])
        ->assertSessionHasErrors('booking_date');

    expect(Booking::count())->toBe(0);
});

test('the court page marks held and booked slots distinctly', function () {
    $court = bookableCourt();
    $held = TimeSlot::factory()->for($court)->create(['start_time' => '08:00', 'end_time' => '09:00']);
    $booked = TimeSlot::factory()->for($court)->create(['start_time' => '09:00', 'end_time' => '10:00']);
    $free = TimeSlot::factory()->for($court)->create(['start_time' => '10:00', 'end_time' => '11:00']);
    $date = today()->addDay();

    Booking::factory()->hasAttached($held)->create([
        'court_id' => $court->id,
        'booking_date' => $date,
        'status' => BookingStatus::PendingPayment,
        'expires_at' => now()->addMinutes(5),
    ]);
    Booking::factory()->hasAttached($booked)->create([
        'court_id' => $court->id,
        'booking_date' => $date,
        'status' => BookingStatus::Confirmed,
    ]);

    $this->get(route('courts.show', ['court' => $court, 'date' => $date->toDateString()]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('slots.0.state', 'held')
            ->where('slots.1.state', 'booked')
            ->where('slots.2.state', 'available'));
});

test('the expire command frees an unpaid hold and labels it expired', function () {
    $court = bookableCourt();
    $slot = TimeSlot::factory()->for($court)->create();

    $booking = Booking::factory()->hasAttached($slot)->create([
        'court_id' => $court->id,
        'status' => BookingStatus::PendingPayment,
        'expires_at' => now()->subMinute(),
    ]);

    $this->artisan('bookings:expire')->assertSuccessful();

    expect($booking->fresh()->status)->toBe(BookingStatus::Expired);
});

test('the court page reports a closed date', function () {
    $court = bookableCourt();
    $date = today()->addDay()->toDateString();
    ClosedDate::create(['date' => $date]);

    $this->get(route('courts.show', ['court' => $court, 'date' => $date]))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('closed', true));
});

test('a booking requires at least one slot', function () {
    $court = bookableCourt();

    $this->actingAs(User::factory()->create())
        ->from(route('courts.show', $court))
        ->post(route('bookings.store'), [
            'court_id' => $court->id,
            'time_slot_ids' => [],
            'booking_date' => today()->addDay()->toDateString(),
        ])
        ->assertSessionHasErrors('time_slot_ids');
});

test('a blocking booking removes a slot from availability', function () {
    $court = bookableCourt();
    $slot = TimeSlot::factory()->for($court)->create();
    $date = today()->addDay();

    Booking::factory()->hasAttached($slot)->create([
        'court_id' => $court->id,
        'booking_date' => $date,
        'status' => BookingStatus::Confirmed,
    ]);

    $taken = TimeSlot::where('court_id', $court->id)
        ->whereHas('bookings', fn ($query) => $query
            ->whereDate('booking_date', $date)
            ->blocking())
        ->pluck('id');

    expect($taken)->toContain($slot->id);
});

test('a second user cannot book a slot that is already held', function () {
    $court = bookableCourt();
    $slot = TimeSlot::factory()->for($court)->create();
    $date = today()->addDay()->toDateString();

    Booking::factory()->hasAttached($slot)->create([
        'court_id' => $court->id,
        'booking_date' => $date,
        'status' => BookingStatus::AwaitingConfirmation,
    ]);

    $this->actingAs(User::factory()->create())
        ->post(route('bookings.store'), [
            'court_id' => $court->id,
            'time_slot_ids' => [$slot->id],
            'booking_date' => $date,
        ])
        ->assertStatus(409);

    expect(Booking::count())->toBe(1);
});

test('booking a block fails if any one slot is taken', function () {
    $court = bookableCourt();
    $free = TimeSlot::factory()->for($court)->create(['start_time' => '08:00', 'end_time' => '09:00']);
    $taken = TimeSlot::factory()->for($court)->create(['start_time' => '09:00', 'end_time' => '10:00']);
    $date = today()->addDay()->toDateString();

    Booking::factory()->hasAttached($taken)->create([
        'court_id' => $court->id,
        'booking_date' => $date,
        'status' => BookingStatus::Confirmed,
    ]);

    $this->actingAs(User::factory()->create())
        ->post(route('bookings.store'), [
            'court_id' => $court->id,
            'time_slot_ids' => [$free->id, $taken->id],
            'booking_date' => $date,
        ])
        ->assertStatus(409);

    expect(Booking::count())->toBe(1);
});

test('an expired hold frees the slot for a new booking', function () {
    $court = bookableCourt();
    $slot = TimeSlot::factory()->for($court)->create();
    $date = today()->addDay()->toDateString();

    Booking::factory()->hasAttached($slot)->create([
        'court_id' => $court->id,
        'booking_date' => $date,
        'status' => BookingStatus::PendingPayment,
        'expires_at' => now()->subMinute(),
    ]);

    $this->actingAs(User::factory()->create())
        ->post(route('bookings.store'), [
            'court_id' => $court->id,
            'time_slot_ids' => [$slot->id],
            'booking_date' => $date,
        ])
        ->assertSessionHasNoErrors();

    expect(Booking::count())->toBe(2);
});

test('a user can mark their booking as paid', function () {
    Storage::fake('public');

    $user = User::factory()->create();
    $court = bookableCourt();
    $slot = TimeSlot::factory()->for($court)->create();

    $booking = Booking::factory()->hasAttached($slot)->create([
        'user_id' => $user->id,
        'court_id' => $court->id,
        'status' => BookingStatus::PendingPayment,
        'expires_at' => now()->addMinutes(5),
    ]);

    $this->actingAs($user)
        ->post(route('bookings.paid', $booking->reference_code), [
            'payment_proof' => UploadedFile::fake()->image('proof.jpg'),
        ])
        ->assertSessionHasNoErrors();

    $booking->refresh();

    expect($booking->status)->toBe(BookingStatus::AwaitingConfirmation);
    expect($booking->paid_at)->not->toBeNull();
    Storage::disk('public')->assertExists($booking->payment_proof_path);
});

test('an expired booking cannot be marked as paid', function () {
    $user = User::factory()->create();

    $booking = Booking::factory()->create([
        'user_id' => $user->id,
        'status' => BookingStatus::PendingPayment,
        'expires_at' => now()->subMinute(),
    ]);

    $this->actingAs($user)
        ->post(route('bookings.paid', $booking->reference_code))
        ->assertRedirect(route('bookings.pay', $booking->reference_code));

    expect($booking->fresh()->status)->toBe(BookingStatus::PendingPayment);
});

test('a user cannot view another user booking pay page', function () {
    $booking = Booking::factory()->create([
        'user_id' => User::factory()->create()->id,
    ]);

    $this->actingAs(User::factory()->create())
        ->get(route('bookings.pay', $booking->reference_code))
        ->assertForbidden();
});
