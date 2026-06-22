<?php

namespace App\Actions;

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\Court;
use App\Models\Setting;
use App\Models\TimeSlot;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CreateBooking
{
    /**
     * Create a single timed hold covering one or more slots on the same date.
     *
     * The candidate slot rows are locked for the duration of the transaction so
     * two simultaneous requests for any overlapping slot are serialized, and
     * availability is re-checked inside the lock before the hold is created.
     *
     * @param  array<int, string>  $slotIds
     * @param  array{guest_name?: string, guest_phone?: string}  $guest
     */
    public function __invoke(?User $user, Court $court, array $slotIds, string $date, array $guest = []): Booking
    {
        $slotIds = array_values(array_unique($slotIds));

        return DB::transaction(function () use ($user, $court, $slotIds, $date, $guest): Booking {
            $slots = TimeSlot::where('court_id', $court->id)
                ->where('is_active', true)
                ->whereIn('id', $slotIds)
                ->lockForUpdate()
                ->get();

            if ($slots->count() !== count($slotIds)) {
                abort(422, 'One or more selected slots are no longer available.');
            }

            $alreadyTaken = Booking::whereDate('booking_date', $date)
                ->whereHas('timeSlots', fn ($query) => $query->whereIn('time_slots.id', $slotIds))
                ->blocking()
                ->exists();

            if ($alreadyTaken) {
                abort(409, 'One of those slots was just taken. Please pick another time.');
            }

            $booking = Booking::create([
                'user_id' => $user?->id,
                'guest_name' => $user ? null : ($guest['guest_name'] ?? null),
                'guest_phone' => $user ? null : ($guest['guest_phone'] ?? null),
                'court_id' => $court->id,
                'booking_date' => $date,
                'status' => BookingStatus::PendingPayment,
                'amount' => $slots->sum(fn (TimeSlot $slot): float => $slot->price),
                'reference_code' => $this->uniqueReferenceCode(),
                'expires_at' => now()->addMinutes((int) Setting::get('hold_minutes', 5)),
            ]);

            $booking->timeSlots()->attach($slots->pluck('id'));

            return $booking;
        });
    }

    private function uniqueReferenceCode(): string
    {
        do {
            $code = 'PB-'.strtoupper(Str::random(6));
        } while (Booking::where('reference_code', $code)->exists());

        return $code;
    }
}
