<?php

namespace App\Models;

use Database\Factories\SettingFactory;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string $id
 * @property string $key
 * @property string|null $value
 */
class Setting extends Model
{
    /** @use HasFactory<SettingFactory> */
    use HasFactory, HasUlids;

    protected $fillable = ['key', 'value'];

    public static function get(string $key, mixed $default = null): mixed
    {
        return cache()->rememberForever(
            "setting:{$key}",
            fn () => static::where('key', $key)->value('value')
        ) ?? $default;
    }

    public static function put(string $key, mixed $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => $value]);
        cache()->forget("setting:{$key}");
    }
}
