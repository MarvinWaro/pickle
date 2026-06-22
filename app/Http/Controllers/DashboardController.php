<?php

namespace App\Http\Controllers;

use App\Enums\BookingStatus;
use App\Models\Booking;
use Carbon\CarbonInterface;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
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

        $userId = $request->user()->id;

        $paidBookings = Booking::where('user_id', $userId)
            ->whereIn('status', [BookingStatus::AwaitingConfirmation, BookingStatus::Confirmed])
            ->get(['booking_date', 'amount']);

        $bookings = Booking::where('user_id', $userId)
            ->with(['court:id,name', 'timeSlots' => fn ($query) => $query->orderBy('start_time')])
            ->latest()
            ->limit(25)
            ->get();

        return Inertia::render('dashboard', [
            'stats' => [
                'total_spent' => round((float) $paidBookings->sum(fn (Booking $booking): float => (float) $booking->amount), 2),
                'sessions' => $paidBookings->count(),
                'days_played' => $paidBookings
                    ->map(fn (Booking $booking): string => $booking->booking_date->toDateString())
                    ->unique()
                    ->count(),
                'streak' => $this->weeklyStreak($paidBookings->pluck('booking_date')),
            ],
            'bookings' => $bookings->map(fn (Booking $booking): array => $this->bookingRow($booking)),
        ]);
    }

    /**
     * Count of consecutive weeks (from the current week backwards) with a booking.
     *
     * @param  Collection<int, CarbonInterface>  $dates
     */
    private function weeklyStreak(Collection $dates): int
    {
        $weeks = $dates
            ->map(fn (CarbonInterface $date): string => $date->format('o-W'))
            ->flip();

        $streak = 0;
        $cursor = Carbon::now()->startOfWeek();

        while ($weeks->has($cursor->format('o-W'))) {
            $streak++;
            $cursor->subWeek();
        }

        return $streak;
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
