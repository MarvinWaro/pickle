<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property Carbon $date
 * @property string|null $reason
 */
class ClosedDate extends Model
{
    use HasUlids;

    protected $fillable = ['date', 'reason'];

    protected $casts = [
        'date' => 'date',
    ];

    /**
     * Whether the venue is closed (not bookable) on the given date.
     */
    public static function isClosed(string $date): bool
    {
        return static::whereDate('date', $date)->exists();
    }
}
