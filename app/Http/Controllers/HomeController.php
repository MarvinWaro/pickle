<?php

namespace App\Http\Controllers;

use App\Models\Court;
use App\Models\Setting;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * Show the public landing page with the active, bookable courts.
     */
    public function index(): Response
    {
        $courts = Court::query()
            ->where('is_active', true)
            ->with(['amenities:id,name', 'images'])
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return Inertia::render('welcome', [
            'courts' => $courts,
            'venueName' => Setting::get('venue_name', config('app.name')),
        ]);
    }
}
