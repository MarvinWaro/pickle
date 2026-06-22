<?php

namespace App\Http\Controllers\Admin;

use App\Enums\BookingStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\RejectBookingRequest;
use App\Models\Booking;
use App\Models\TimeSlot;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $this->resolveStatusFilter($request->query('status'));

        $bookings = Booking::query()
            ->with([
                'court:id,name',
                'user:id,name',
                'timeSlots' => fn ($query) => $query->orderBy('start_time'),
            ])
            ->when($status, fn ($query) => $query->where('status', $status))
            ->latest()
            ->paginate(20)
            ->withQueryString()
            ->through(fn (Booking $booking): array => $this->row($booking));

        return Inertia::render('admin/bookings/index', [
            'bookings' => $bookings,
            'filters' => ['status' => $status],
            'statusCounts' => Booking::query()
                ->selectRaw('status, count(*) as total')
                ->groupBy('status')
                ->pluck('total', 'status'),
        ]);
    }

    public function confirm(Booking $booking): RedirectResponse
    {
        if ($booking->status === BookingStatus::AwaitingConfirmation) {
            $booking->update([
                'status' => BookingStatus::Confirmed,
                'confirmed_at' => now(),
            ]);

            Inertia::flash('toast', ['type' => 'success', 'message' => __('Booking confirmed.')]);
        }

        return back();
    }

    public function reject(RejectBookingRequest $request, Booking $booking): RedirectResponse
    {
        if ($booking->status === BookingStatus::AwaitingConfirmation) {
            $booking->update([
                'status' => BookingStatus::Rejected,
                'notes' => $request->validated('reason'),
            ]);

            Inertia::flash('toast', ['type' => 'success', 'message' => __('Booking rejected. The slot is now free.')]);
        }

        return back();
    }

    /**
     * Cancel a booking the venue can no longer honor (e.g. a closed date).
     */
    public function cancel(RejectBookingRequest $request, Booking $booking): RedirectResponse
    {
        if (in_array($booking->status, [BookingStatus::AwaitingConfirmation, BookingStatus::Confirmed], true)) {
            $booking->update([
                'status' => BookingStatus::Cancelled,
                'notes' => $request->validated('reason'),
            ]);

            Inertia::flash('toast', ['type' => 'success', 'message' => __('Booking cancelled. The slot is now free.')]);
        }

        return back();
    }

    private function resolveStatusFilter(?string $status): ?string
    {
        $valid = array_column(BookingStatus::cases(), 'value');

        return in_array($status, $valid, true) ? $status : null;
    }

    /**
     * @return array<string, mixed>
     */
    private function row(Booking $booking): array
    {
        return [
            'id' => $booking->id,
            'reference_code' => $booking->reference_code,
            'customer_name' => $booking->customer_name ?? 'Guest',
            'guest_phone' => $booking->guest_phone,
            'is_guest' => $booking->user_id === null,
            'court_name' => $booking->court->name,
            'booking_date' => $booking->booking_date->toDateString(),
            'slots' => $booking->timeSlots
                ->map(fn (TimeSlot $slot): string => Carbon::parse($slot->start_time)->format('g:i A')
                    .' – '.Carbon::parse($slot->end_time)->format('g:i A'))
                ->values(),
            'amount' => $booking->amount,
            'status' => $booking->status->value,
            'proof_url' => $booking->payment_proof_path
                ? asset('storage/'.$booking->payment_proof_path)
                : null,
        ];
    }
}
