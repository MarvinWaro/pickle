<?php

use App\Models\Court;
use App\Models\TimeSlot;
use App\Models\User;

function slotAdmin(): User
{
    return User::factory()->create(['role' => 'admin']);
}

test('non-admins cannot manage slots', function () {
    $court = Court::factory()->create();

    $this->actingAs(User::factory()->create(['role' => 'user']))
        ->get(route('admin.courts.slots.index', $court))
        ->assertForbidden();
});

test('an admin can view a court slots page', function () {
    $court = Court::factory()->create();
    TimeSlot::factory()->for($court)->create();

    $this->actingAs(slotAdmin())
        ->get(route('admin.courts.slots.index', $court))
        ->assertOk();
});

test('an admin can add a time slot', function () {
    $court = Court::factory()->create();

    $this->actingAs(slotAdmin())
        ->post(route('admin.courts.slots.store', $court), [
            'start_time' => '08:00',
            'end_time' => '09:00',
        ])
        ->assertSessionHasNoErrors();

    expect($court->timeSlots()->count())->toBe(1);
});

test('a slot without an override inherits the court base rate', function () {
    $court = Court::factory()->create(['price_per_hour' => 200]);
    $slot = TimeSlot::factory()->for($court)->create([
        'start_time' => '08:00',
        'end_time' => '09:00',
        'price_per_hour' => null,
    ]);

    expect($slot->price)->toBe(200.0);
});

test('an evening slot can charge a premium rate', function () {
    $court = Court::factory()->create(['price_per_hour' => 200]);

    $this->actingAs(slotAdmin())
        ->post(route('admin.courts.slots.store', $court), [
            'start_time' => '18:00',
            'end_time' => '19:00',
            'price_per_hour' => '300',
        ])
        ->assertSessionHasNoErrors();

    $slot = $court->timeSlots()->first();

    expect($slot->price_per_hour)->toBe('300.00');
    expect($slot->price)->toBe(300.0);
});

test('the end time must be after the start time', function () {
    $court = Court::factory()->create();

    $this->actingAs(slotAdmin())
        ->from(route('admin.courts.slots.index', $court))
        ->post(route('admin.courts.slots.store', $court), [
            'start_time' => '09:00',
            'end_time' => '08:00',
        ])
        ->assertSessionHasErrors('end_time');
});

test('overlapping time slots are rejected', function () {
    $court = Court::factory()->create();
    TimeSlot::factory()->for($court)->create(['start_time' => '08:00', 'end_time' => '09:00']);

    $this->actingAs(slotAdmin())
        ->from(route('admin.courts.slots.index', $court))
        ->post(route('admin.courts.slots.store', $court), [
            'start_time' => '08:30',
            'end_time' => '09:30',
        ])
        ->assertSessionHasErrors('start_time');
});

test('an admin can delete a time slot', function () {
    $court = Court::factory()->create();
    $slot = TimeSlot::factory()->for($court)->create();

    $this->actingAs(slotAdmin())
        ->delete(route('admin.courts.slots.destroy', [$court, $slot]))
        ->assertSessionHasNoErrors();

    expect(TimeSlot::find($slot->id))->toBeNull();
});

test('slots are scoped to their court', function () {
    $courtA = Court::factory()->create();
    $courtB = Court::factory()->create();
    $slot = TimeSlot::factory()->for($courtB)->create();

    $this->actingAs(slotAdmin())
        ->delete(route('admin.courts.slots.destroy', [$courtA, $slot]))
        ->assertNotFound();
});
