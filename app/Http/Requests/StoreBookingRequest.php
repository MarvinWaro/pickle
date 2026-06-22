<?php

namespace App\Http\Requests;

use App\Models\ClosedDate;
use App\Models\TimeSlot;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class StoreBookingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    public function rules(): array
    {
        $isGuest = $this->user() === null;

        return [
            'court_id' => ['required', 'string', 'exists:courts,id'],
            'time_slot_ids' => ['required', 'array', 'min:1'],
            'time_slot_ids.*' => ['string', 'exists:time_slots,id'],
            'booking_date' => ['required', 'date', 'after_or_equal:today'],
            'guest_name' => [$isGuest ? 'required' : 'nullable', 'string', 'max:255'],
            'guest_phone' => [$isGuest ? 'required' : 'nullable', 'string', 'max:50'],
        ];
    }

    /**
     * Ensure every chosen slot belongs to the active court and is bookable.
     *
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }

                if (ClosedDate::isClosed($this->input('booking_date'))) {
                    $validator->errors()->add(
                        'booking_date',
                        'The venue is closed on that date. Please pick another day.',
                    );

                    return;
                }

                $slotIds = (array) $this->input('time_slot_ids', []);

                $bookableCount = TimeSlot::whereIn('id', $slotIds)
                    ->where('court_id', $this->input('court_id'))
                    ->where('is_active', true)
                    ->whereHas('court', fn ($query) => $query->where('is_active', true))
                    ->count();

                if ($bookableCount !== count(array_unique($slotIds))) {
                    $validator->errors()->add(
                        'time_slot_ids',
                        'One or more selected slots are not available for booking.',
                    );
                }
            },
        ];
    }
}
