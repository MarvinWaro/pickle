<?php

namespace App\Enums;

enum BookingStatus: string
{
    case PendingPayment = 'pending_payment';
    case AwaitingConfirmation = 'awaiting_confirmation';
    case Confirmed = 'confirmed';
    case Expired = 'expired';
    case Rejected = 'rejected';
    case Cancelled = 'cancelled';
}
