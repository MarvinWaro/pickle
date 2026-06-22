<?php

namespace App\Models;

use Database\Factories\AmenityFactory;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * @property string $id
 * @property string $name
 */
class Amenity extends Model
{
    /** @use HasFactory<AmenityFactory> */
    use HasFactory, HasUlids;

    protected $fillable = ['name'];

    /**
     * @return BelongsToMany<Court, $this>
     */
    public function courts(): BelongsToMany
    {
        return $this->belongsToMany(Court::class);
    }
}
