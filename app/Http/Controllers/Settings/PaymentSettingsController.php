<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdatePaymentRequest;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PaymentSettingsController extends Controller
{
    public function edit(): Response
    {
        $qrPath = Setting::get('payment_qr_path');

        return Inertia::render('settings/venue/payment', [
            'payment' => [
                'payment_method' => Setting::get('payment_method'),
                'payment_account_name' => Setting::get('payment_account_name'),
                'payment_account_number' => Setting::get('payment_account_number'),
                'messenger_link' => Setting::get('messenger_link'),
                'payment_instructions' => Setting::get('payment_instructions'),
                'hold_minutes' => Setting::get('hold_minutes', '5'),
                'qr_url' => $qrPath ? asset('storage/'.$qrPath) : null,
            ],
        ]);
    }

    public function update(UpdatePaymentRequest $request): RedirectResponse
    {
        foreach ([
            'payment_method',
            'payment_account_name',
            'payment_account_number',
            'messenger_link',
            'payment_instructions',
            'hold_minutes',
        ] as $key) {
            Setting::put($key, $request->validated($key));
        }

        if ($request->hasFile('payment_qr')) {
            $this->replaceFile('payment_qr_path', $request->file('payment_qr')->store('payment', 'public'));
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Payment settings updated.')]);

        return back();
    }

    private function replaceFile(string $key, string $newPath): void
    {
        $old = Setting::get($key);

        if ($old) {
            Storage::disk('public')->delete($old);
        }

        Setting::put($key, $newPath);
    }
}
