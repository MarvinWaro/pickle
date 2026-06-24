<?php

namespace App\Http\Controllers;

use App\Enums\BookingStatus;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        if ($request->user()->role === 'admin') {
            return Inertia::render('dashboard', [
                'admin' => [
                    'today_count' => Booking::whereDate('booking_date', today())->blocking()->count(),
                    'pending_count' => Booking::where('status', BookingStatus::AwaitingConfirmation)->count(),
                    'confirmed_count' => Booking::where('status', BookingStatus::Confirmed)->count(),
                ],
            ]);
        }

        // Lifetime player stats are shared globally (see HandleInertiaRequests)
        // so the persistent profile rail can render them on every page.
        $bookings = Booking::where('user_id', $request->user()->id)
            ->with(['court:id,name', 'timeSlots' => fn ($query) => $query->orderBy('start_time')])
            ->latest()
            ->limit(25)
            ->get();

        return Inertia::render('dashboard', [
            'bookings' => $bookings->map(fn (Booking $booking): array => $this->bookingRow($booking)),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function bookingRow(Booking $booking): array
    {
        return [
            'reference_code' => $booking->reference_code,
            'court_name' => $booking->court->name,
            'booking_date' => $booking->booking_date->toDateString(),
            'slots' => $booking->timeSlots
                ->map(fn ($slot): string => Carbon::parse($slot->start_time)->format('g:i A')
                    .' – '.Carbon::parse($slot->end_time)->format('g:i A'))
                ->values(),
            'amount' => $booking->amount,
            'status' => $booking->status->value,
            'notes' => $booking->notes,
            'can_cancel' => in_array($booking->status, [
                BookingStatus::PendingPayment,
                BookingStatus::AwaitingConfirmation,
                BookingStatus::Confirmed,
            ], true) && ! $booking->booking_date->isPast(),
        ];
    }
}
