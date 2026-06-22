<?php

namespace App\Console\Commands;

use App\Enums\BookingStatus;
use App\Models\Booking;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('bookings:expire')]
#[Description('Expire pending bookings whose hold time has passed')]
class ExpireBookings extends Command
{
    public function handle(): void
    {
        $count = Booking::where('status', BookingStatus::PendingPayment)
            ->where('expires_at', '<', now())
            ->update(['status' => BookingStatus::Expired]);

        $this->info("Expired {$count} booking(s).");
    }
}
