<?php

namespace App\Support;

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class PlayerBookingStats
{
    /**
     * Lifetime booking stats for a player, shown in the profile rail.
     *
     * @return array{total_spent: float, sessions: int, days_played: int, streak: int}
     */
    public static function for(User $user): array
    {
        $paidBookings = Booking::where('user_id', $user->id)
            ->whereIn('status', [BookingStatus::AwaitingConfirmation, BookingStatus::Confirmed])
            ->get(['booking_date', 'amount']);

        return [
            'total_spent' => round((float) $paidBookings->sum(fn (Booking $booking): float => (float) $booking->amount), 2),
            'sessions' => $paidBookings->count(),
            'days_played' => $paidBookings
                ->map(fn (Booking $booking): string => $booking->booking_date->toDateString())
                ->unique()
                ->count(),
            'streak' => self::weeklyStreak($paidBookings->pluck('booking_date')),
        ];
    }

    /**
     * Count of consecutive weeks (from the current week backwards) with a booking.
     *
     * @param  Collection<int, CarbonInterface>  $dates
     */
    private static function weeklyStreak(Collection $dates): int
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
}
