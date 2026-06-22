<?php

namespace App\Models;

use App\Enums\BookingStatus;
use Database\Factories\BookingFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string|null $user_id
 * @property string|null $guest_name
 * @property string|null $guest_phone
 * @property string $court_id
 * @property Carbon $booking_date
 * @property BookingStatus $status
 * @property string $amount
 * @property string $reference_code
 * @property Carbon|null $expires_at
 * @property Carbon|null $paid_at
 * @property Carbon|null $confirmed_at
 * @property string|null $payment_proof_path
 * @property string|null $notes
 */
class Booking extends Model
{
    /** @use HasFactory<BookingFactory> */
    use HasFactory, HasUlids;

    protected $fillable = [
        'user_id', 'guest_name', 'guest_phone', 'court_id', 'booking_date', 'status',
        'amount', 'reference_code', 'expires_at', 'paid_at', 'confirmed_at',
        'payment_proof_path', 'notes',
    ];

    protected $casts = [
        'booking_date' => 'date',
        'amount' => 'decimal:2',
        'status' => BookingStatus::class,
        'expires_at' => 'datetime',
        'paid_at' => 'datetime',
        'confirmed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Display name for the booker, whether a registered user or a guest.
     */
    public function getCustomerNameAttribute(): ?string
    {
        return $this->user?->name ?? $this->guest_name;
    }

    public function court(): BelongsTo
    {
        return $this->belongsTo(Court::class);
    }

    /**
     * @return BelongsToMany<TimeSlot, $this>
     */
    public function timeSlots(): BelongsToMany
    {
        return $this->belongsToMany(TimeSlot::class);
    }

    /** Bookings that currently occupy a slot (active holds + confirmed). */
    public function scopeBlocking(Builder $query): Builder
    {
        return $query->where(function (Builder $q) {
            $q->whereIn('status', [
                BookingStatus::AwaitingConfirmation,
                BookingStatus::Confirmed,
            ])->orWhere(fn (Builder $q2) => $q2
                ->where('status', BookingStatus::PendingPayment)
                ->where('expires_at', '>', now())
            );
        });
    }
}
