<?php

namespace App\Models;

use Database\Factories\TimeSlotFactory;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $court_id
 * @property string $start_time
 * @property string $end_time
 * @property string|null $price_per_hour
 * @property bool $is_active
 */
class TimeSlot extends Model
{
    /** @use HasFactory<TimeSlotFactory> */
    use HasFactory, HasUlids;

    protected $fillable = ['court_id', 'start_time', 'end_time', 'price_per_hour', 'is_active'];

    protected $casts = [
        'price_per_hour' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function court(): BelongsTo
    {
        return $this->belongsTo(Court::class);
    }

    /**
     * @return BelongsToMany<Booking, $this>
     */
    public function bookings(): BelongsToMany
    {
        return $this->belongsToMany(Booking::class);
    }

    public function getDurationHoursAttribute(): float
    {
        return Carbon::parse($this->start_time)
            ->diffInMinutes(Carbon::parse($this->end_time)) / 60;
    }

    /**
     * The effective hourly rate — the slot's own override, or the court's base rate.
     */
    public function getHourlyRateAttribute(): float
    {
        return (float) ($this->price_per_hour ?? $this->court->price_per_hour);
    }

    public function getPriceAttribute(): float
    {
        return round($this->hourly_rate * $this->duration_hours, 2);
    }
}
