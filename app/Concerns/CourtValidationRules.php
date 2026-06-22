<?php

namespace App\Concerns;

use Illuminate\Contracts\Validation\ValidationRule;

trait CourtValidationRules
{
    /**
     * Get the validation rules used to validate a court.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    protected function courtRules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'surface' => ['nullable', 'string', 'max:255'],
            'price_per_hour' => ['required', 'numeric', 'min:0', 'max:999999.99'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'is_active' => ['boolean'],
            'amenities' => ['array'],
            'amenities.*' => ['string', 'max:255'],
            'images' => ['array', 'max:5'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'removed_image_ids' => ['array'],
            'removed_image_ids.*' => ['string'],
        ];
    }
}
