<?php

namespace App\Http\Controllers;

use App\Actions\CreateBooking;
use App\Enums\BookingStatus;
use App\Http\Requests\MarkBookingPaidRequest;
use App\Http\Requests\StoreBookingRequest;
use App\Models\Booking;
use App\Models\Court;
use App\Models\Setting;
use App\Models\TimeSlot;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function find(): Response
    {
        return Inertia::render('bookings/find');
    }

    public function lookup(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'reference_code' => ['required', 'string'],
        ]);

        $reference = strtoupper(trim($validated['reference_code']));
        $exists = Booking::where('reference_code', $reference)->exists();

        if (! $exists) {
            return back()->withErrors([
                'reference_code' => __('We could not find a booking with that reference.'),
            ]);
        }

        return to_route('bookings.pay', $reference);
    }

    public function store(StoreBookingRequest $request, CreateBooking $createBooking): RedirectResponse
    {
        $court = Court::findOrFail($request->validated('court_id'));

        $booking = $createBooking(
            $request->user(),
            $court,
            $request->validated('time_slot_ids'),
            $request->validated('booking_date'),
            $request->only('guest_name', 'guest_phone'),
        );

        $request->session()->push('guest_bookings', $booking->reference_code);

        return to_route('bookings.pay', $booking->reference_code);
    }

    public function pay(Request $request, Booking $booking): Response
    {
        $this->authorizeBookingAccess($request, $booking);

        $booking->load([
            'court:id,name,payment_qr_path',
            'timeSlots' => fn ($query) => $query->orderBy('start_time'),
        ]);

        return Inertia::render('bookings/pay', [
            'booking' => $this->bookingPayload($booking),
            'qrUrl' => $this->resolveQrUrl($booking),
            'payment' => [
                'method' => Setting::get('payment_method'),
                'account_name' => Setting::get('payment_account_name'),
                'account_number' => Setting::get('payment_account_number'),
                'instructions' => Setting::get('payment_instructions'),
                'messenger_link' => Setting::get('messenger_link'),
            ],
        ]);
    }

    public function paid(MarkBookingPaidRequest $request, Booking $booking): RedirectResponse
    {
        if ($booking->status !== BookingStatus::PendingPayment || $booking->expires_at?->isPast()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => __('This booking can no longer be marked as paid.')]);

            return to_route('bookings.pay', $booking->reference_code);
        }

        $attributes = [
            'status' => BookingStatus::AwaitingConfirmation,
            'paid_at' => now(),
        ];

        if ($request->hasFile('payment_proof')) {
            $attributes['payment_proof_path'] = $request->file('payment_proof')->store('proofs', 'public');
        }

        $booking->update($attributes);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Payment submitted. Awaiting confirmation.')]);

        return to_route('bookings.pay', $booking->reference_code);
    }

    public function cancel(Request $request, Booking $booking): RedirectResponse
    {
        $this->authorizeBookingAccess($request, $booking);

        $cancellable = [
            BookingStatus::PendingPayment,
            BookingStatus::AwaitingConfirmation,
            BookingStatus::Confirmed,
        ];

        if (in_array($booking->status, $cancellable, true)) {
            $booking->update(['status' => BookingStatus::Cancelled]);
            Inertia::flash('toast', ['type' => 'success', 'message' => __('Booking cancelled.')]);
        }

        return back();
    }

    /**
     * Owners must match; guest bookings (no user) are reachable by reference code.
     */
    private function authorizeBookingAccess(Request $request, Booking $booking): void
    {
        abort_unless(
            $booking->user_id === null || $booking->user_id === $request->user()?->id,
            403,
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function bookingPayload(Booking $booking): array
    {
        return [
            'reference_code' => $booking->reference_code,
            'status' => $booking->status->value,
            'amount' => $booking->amount,
            'booking_date' => $booking->booking_date->toDateString(),
            'court_name' => $booking->court->name,
            'slots' => $booking->timeSlots
                ->map(fn (TimeSlot $slot): string => Carbon::parse($slot->start_time)->format('g:i A')
                    .' – '.Carbon::parse($slot->end_time)->format('g:i A'))
                ->values(),
            'expires_at' => $booking->expires_at?->toIso8601String(),
            'notes' => $booking->notes,
        ];
    }

    private function resolveQrUrl(Booking $booking): ?string
    {
        $path = $booking->court->payment_qr_path ?? Setting::get('payment_qr_path');

        return $path ? asset('storage/'.$path) : null;
    }
}
