<?php

namespace App\Http\Requests\Settings;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePaymentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    public function rules(): array
    {
        return [
            'payment_method' => ['nullable', 'string', 'max:100'],
            'payment_account_name' => ['nullable', 'string', 'max:255'],
            'payment_account_number' => ['nullable', 'string', 'max:100'],
            'messenger_link' => ['nullable', 'url', 'max:255'],
            'payment_instructions' => ['nullable', 'string', 'max:2000'],
            'hold_minutes' => ['required', 'integer', 'min:1', 'max:1440'],
            'payment_qr' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }
}
