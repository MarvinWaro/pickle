<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\TimeSlotRequest;
use App\Models\Court;
use App\Models\TimeSlot;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class TimeSlotController extends Controller
{
    public function index(Court $court): Response
    {
        return Inertia::render('admin/courts/slots/index', [
            'court' => [
                'id' => $court->id,
                'name' => $court->name,
                'price_per_hour' => $court->price_per_hour,
            ],
            'slots' => $court->timeSlots()
                ->orderBy('start_time')
                ->get()
                ->map(fn (TimeSlot $slot): array => $this->slotPayload($slot)),
        ]);
    }

    public function store(TimeSlotRequest $request, Court $court): RedirectResponse
    {
        $court->timeSlots()->create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Time slot added.')]);

        return back();
    }

    public function update(TimeSlotRequest $request, Court $court, TimeSlot $slot): RedirectResponse
    {
        abort_unless($slot->court_id === $court->id, 404);

        $slot->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Time slot updated.')]);

        return back();
    }

    public function destroy(Court $court, TimeSlot $slot): RedirectResponse
    {
        abort_unless($slot->court_id === $court->id, 404);

        $slot->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Time slot removed.')]);

        return back();
    }

    /**
     * @return array{id: string, start_time: string, end_time: string, price_per_hour: string|null, is_active: bool, label: string, price: float}
     */
    private function slotPayload(TimeSlot $slot): array
    {
        return [
            'id' => $slot->id,
            'start_time' => substr($slot->start_time, 0, 5),
            'end_time' => substr($slot->end_time, 0, 5),
            'price_per_hour' => $slot->price_per_hour,
            'is_active' => $slot->is_active,
            'label' => Carbon::parse($slot->start_time)->format('g:i A')
                .' – '.Carbon::parse($slot->end_time)->format('g:i A'),
            'price' => $slot->price,
        ];
    }
}
