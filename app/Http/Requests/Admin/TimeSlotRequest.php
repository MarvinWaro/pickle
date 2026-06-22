<?php

namespace App\Http\Requests\Admin;

use App\Models\Court;
use App\Models\TimeSlot;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;

class TimeSlotRequest extends FormRequest
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
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'price_per_hour' => ['nullable', 'numeric', 'min:0', 'max:999999.99'],
            'is_active' => ['boolean'],
        ];
    }

    /**
     * Reject slots that overlap an existing slot on the same court.
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

                /** @var Court $court */
                $court = $this->route('court');
                $slot = $this->route('slot');

                $start = Carbon::parse($this->input('start_time'));
                $end = Carbon::parse($this->input('end_time'));

                $overlaps = $court->timeSlots()
                    ->when($slot instanceof TimeSlot, fn ($query) => $query->whereKeyNot($slot->id))
                    ->get()
                    ->contains(function (TimeSlot $existing) use ($start, $end): bool {
                        return $start->lt(Carbon::parse($existing->end_time))
                            && $end->gt(Carbon::parse($existing->start_time));
                    });

                if ($overlaps) {
                    $validator->errors()->add(
                        'start_time',
                        'This time range overlaps an existing slot.',
                    );
                }
            },
        ];
    }
}
