<?php

namespace App\Http\Requests\Admin;

use App\Concerns\CourtValidationRules;
use App\Models\Court;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCourtRequest extends FormRequest
{
    use CourtValidationRules;

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
        return $this->courtRules();
    }

    /**
     * Ensure the gallery never exceeds five photos after the update is applied.
     *
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                /** @var Court $court */
                $court = $this->route('court');

                $existing = $court->images()->count();
                $removing = count($this->input('removed_image_ids', []));
                $adding = count($this->file('images', []));

                if (($existing - $removing + $adding) > 5) {
                    $validator->errors()->add(
                        'images',
                        'A court can have at most 5 additional photos.',
                    );
                }
            },
        ];
    }
}
