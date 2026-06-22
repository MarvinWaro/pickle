<?php

namespace App\Http\Requests;

use App\Models\Booking;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class MarkBookingPaidRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * Owners must match; guest bookings (no user) are reachable by anyone
     * holding the reference code, which acts as the access token.
     */
    public function authorize(): bool
    {
        $booking = $this->route('booking');

        if (! $booking instanceof Booking) {
            return false;
        }

        return $booking->user_id === null
            || $booking->user_id === $this->user()?->id;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    public function rules(): array
    {
        return [
            'payment_proof' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }
}
