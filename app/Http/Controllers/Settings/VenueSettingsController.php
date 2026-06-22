<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\UpdateBrandingRequest;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class VenueSettingsController extends Controller
{
    public function edit(): Response
    {
        $logoPath = Setting::get('venue_logo_path');

        return Inertia::render('settings/venue/branding', [
            'branding' => [
                'venue_name' => Setting::get('venue_name'),
                'contact_email' => Setting::get('contact_email'),
                'contact_phone' => Setting::get('contact_phone'),
                'logo_url' => $logoPath ? asset('storage/'.$logoPath) : null,
            ],
        ]);
    }

    public function update(UpdateBrandingRequest $request): RedirectResponse
    {
        Setting::put('venue_name', $request->validated('venue_name'));
        Setting::put('contact_email', $request->validated('contact_email'));
        Setting::put('contact_phone', $request->validated('contact_phone'));

        if ($request->hasFile('logo')) {
            $this->replaceFile('venue_logo_path', $request->file('logo')->store('venue', 'public'));
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Branding updated.')]);

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
