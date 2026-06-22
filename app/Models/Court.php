<?php

namespace App\Models;

use Database\Factories\CourtFactory;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property string $id
 * @property string $name
 * @property string|null $description
 * @property string|null $surface
 * @property string|null $image_path
 * @property string $price_per_hour
 * @property string|null $payment_qr_path
 * @property bool $is_active
 * @property int $sort_order
 */
class Court extends Model
{
    /** @use HasFactory<CourtFactory> */
    use HasFactory, HasUlids;

    protected $fillable = [
        'name', 'description', 'surface', 'image_path',
        'price_per_hour', 'payment_qr_path', 'is_active', 'sort_order',
    ];

    protected $casts = [
        'price_per_hour' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * @var list<string>
     */
    protected $appends = ['image_url'];

    public function timeSlots(): HasMany
    {
        return $this->hasMany(TimeSlot::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    /**
     * @return BelongsToMany<Amenity, $this>
     */
    public function amenities(): BelongsToMany
    {
        return $this->belongsToMany(Amenity::class);
    }

    /**
     * Additional gallery photos (extra angles) for the court.
     *
     * @return HasMany<CourtImage, $this>
     */
    public function images(): HasMany
    {
        return $this->hasMany(CourtImage::class)->orderBy('sort_order');
    }

    public function getImageUrlAttribute(): ?string
    {
        return $this->image_path ? asset('storage/'.$this->image_path) : null;
    }

    public function priceForHours(float $hours): float
    {
        return round($this->price_per_hour * $hours, 2);
    }
}
