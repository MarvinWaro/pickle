<?php

namespace App\Http\Controllers;

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\ClosedDate;
use App\Models\Court;
use App\Models\TimeSlot;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class CourtController extends Controller
{
    /**
     * Public court detail with date-based slot availability (lazy expiry).
     */
    public function show(Request $request, Court $court): Response
    {
        abort_unless($court->is_active, 404);

        $date = $this->resolveDate($request->query('date'));
        $closure = ClosedDate::whereDate('date', $date)->first();

        // Paid bookings (awaiting/confirmed) firmly occupy a slot, while an
        // unpaid hold only occupies it until its timer runs out — so a player
        // can watch a "held" slot in case it frees up.
        $bookedSlotIds = $this->slotIdsWithBooking($court, $date, fn ($query) => $query
            ->whereIn('status', [BookingStatus::AwaitingConfirmation, BookingStatus::Confirmed]));

        $heldSlotIds = $this->slotIdsWithBooking($court, $date, fn ($query) => $query
            ->where('status', BookingStatus::PendingPayment)
            ->where('expires_at', '>', now()));

        $slots = $court->timeSlots()
            ->where('is_active', true)
            ->orderBy('start_time')
            ->get()
            ->map(function (TimeSlot $slot) use ($bookedSlotIds, $heldSlotIds, $closure): array {
                $state = match (true) {
                    $bookedSlotIds->contains($slot->id) => 'booked',
                    $heldSlotIds->contains($slot->id) => 'held',
                    default => 'available',
                };

                return [
                    'id' => $slot->id,
                    'label' => Carbon::parse($slot->start_time)->format('g:i A')
                        .' – '.Carbon::parse($slot->end_time)->format('g:i A'),
                    'price' => $slot->price,
                    'state' => $state,
                    'available' => $closure === null && $state === 'available',
                ];
            });

        $court->load(['amenities:id,name', 'images']);

        return Inertia::render('courts/show', [
            'court' => $court,
            'date' => $date->toDateString(),
            'minDate' => Carbon::today()->toDateString(),
            'maxDate' => Carbon::today()->addDays(30)->toDateString(),
            'slots' => $slots,
            'closed' => $closure !== null,
            'closureReason' => $closure?->reason,
        ]);
    }

    /**
     * Ids of the court's slots that have a booking on the date matching the
     * given status constraint.
     *
     * @param  \Closure(Builder<Booking>): void  $constraint
     * @return Collection<int, string>
     */
    private function slotIdsWithBooking(Court $court, Carbon $date, \Closure $constraint): Collection
    {
        return TimeSlot::where('court_id', $court->id)
            ->whereHas('bookings', fn ($query) => $constraint(
                $query->whereDate('booking_date', $date)
            ))
            ->pluck('id');
    }

    /**
     * Clamp the requested date to the bookable window (today .. +30 days).
     */
    private function resolveDate(?string $value): Carbon
    {
        $today = Carbon::today();

        $date = rescue(
            fn (): Carbon => $value ? Carbon::parse($value)->startOfDay() : $today,
            $today,
            report: false,
        );

        if ($date->lt($today)) {
            return $today;
        }

        $max = $today->copy()->addDays(30);

        return $date->gt($max) ? $max : $date;
    }
}
