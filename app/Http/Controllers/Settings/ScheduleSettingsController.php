<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\StoreClosedDateRequest;
use App\Models\Booking;
use App\Models\ClosedDate;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleSettingsController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('settings/venue/schedule', [
            'closedDates' => ClosedDate::query()
                ->orderBy('date')
                ->get()
                ->map(fn (ClosedDate $closed): array => [
                    'id' => $closed->id,
                    'date' => $closed->date->toDateString(),
                    'reason' => $closed->reason,
                ]),
        ]);
    }

    public function store(StoreClosedDateRequest $request): RedirectResponse
    {
        $date = $request->validated('date');

        if (! ClosedDate::whereDate('date', $date)->exists()) {
            ClosedDate::create([
                'date' => $date,
                'reason' => $request->validated('reason'),
            ]);
        }

        // Existing bookings on a now-closed date aren't auto-cancelled (they may
        // already be paid) — warn the admin so they can review/cancel them.
        $existing = Booking::whereDate('booking_date', $date)->blocking()->count();

        if ($existing > 0) {
            Inertia::flash('toast', [
                'type' => 'warning',
                'message' => __(':count existing booking(s) on this date remain — review them under Bookings.', ['count' => $existing]),
            ]);
        } else {
            Inertia::flash('toast', ['type' => 'success', 'message' => __('Day closed for bookings.')]);
        }

        return back();
    }

    public function destroy(ClosedDate $closedDate): RedirectResponse
    {
        $closedDate->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Day reopened for bookings.')]);

        return back();
    }
}
