<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property string $id
 * @property string $court_id
 * @property string $path
 * @property int $sort_order
 */
class CourtImage extends Model
{
    use HasUlids;

    protected $fillable = ['court_id', 'path', 'sort_order'];

    /**
     * @var list<string>
     */
    protected $appends = ['image_url'];

    public function court(): BelongsTo
    {
        return $this->belongsTo(Court::class);
    }

    public function getImageUrlAttribute(): ?string
    {
        return $this->path ? asset('storage/'.$this->path) : null;
    }
}
