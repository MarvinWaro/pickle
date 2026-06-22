<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreCourtRequest;
use App\Http\Requests\Admin\UpdateCourtRequest;
use App\Models\Amenity;
use App\Models\Court;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CourtController extends Controller
{
    public function index(): Response
    {
        $courts = Court::query()
            ->with('amenities:id,name')
            ->withCount('bookings')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/courts/index', [
            'courts' => $courts,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/courts/create', [
            'amenitySuggestions' => Amenity::orderBy('name')->pluck('name'),
        ]);
    }

    public function store(StoreCourtRequest $request): RedirectResponse
    {
        $attributes = $this->courtAttributes($request);

        if ($request->hasFile('image')) {
            $attributes['image_path'] = $request->file('image')->store('courts', 'public');
        }

        $court = Court::create($attributes);
        $this->syncAmenities($court, $request->validated('amenities', []));
        $this->addGalleryImages($court, $request->file('images', []));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Court created.')]);

        return to_route('admin.courts.index');
    }

    public function edit(Court $court): Response
    {
        $court->load(['amenities:id,name', 'images']);

        return Inertia::render('admin/courts/edit', [
            'court' => $court,
            'amenitySuggestions' => Amenity::orderBy('name')->pluck('name'),
        ]);
    }

    public function update(UpdateCourtRequest $request, Court $court): RedirectResponse
    {
        $attributes = $this->courtAttributes($request);

        if ($request->hasFile('image')) {
            $this->deleteImage($court);
            $attributes['image_path'] = $request->file('image')->store('courts', 'public');
        }

        $court->update($attributes);
        $this->syncAmenities($court, $request->validated('amenities', []));
        $this->removeGalleryImages($court, $request->validated('removed_image_ids', []));
        $this->addGalleryImages($court, $request->file('images', []));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Court updated.')]);

        return to_route('admin.courts.index');
    }

    public function destroy(Court $court): RedirectResponse
    {
        $this->deleteImage($court);

        foreach ($court->images as $image) {
            Storage::disk('public')->delete($image->path);
        }

        $court->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Court deleted.')]);

        return to_route('admin.courts.index');
    }

    /**
     * Build the column attributes for a court from the validated request.
     *
     * @return array<string, mixed>
     */
    private function courtAttributes(StoreCourtRequest|UpdateCourtRequest $request): array
    {
        return [
            'name' => $request->validated('name'),
            'description' => $request->validated('description'),
            'surface' => $request->validated('surface'),
            'price_per_hour' => $request->validated('price_per_hour'),
            'is_active' => $request->boolean('is_active'),
        ];
    }

    /**
     * Resolve amenity names to ids (creating any that are new) and sync them.
     *
     * @param  array<int, string>  $names
     */
    private function syncAmenities(Court $court, array $names): void
    {
        $ids = collect($names)
            ->map(fn (string $name): string => trim($name))
            ->filter()
            ->unique()
            ->map(fn (string $name): string => Amenity::firstOrCreate(['name' => $name])->id)
            ->all();

        $court->amenities()->sync($ids);
    }

    private function deleteImage(Court $court): void
    {
        if ($court->image_path) {
            Storage::disk('public')->delete($court->image_path);
        }
    }

    /**
     * Store newly uploaded gallery photos for the court.
     *
     * @param  array<int, UploadedFile>  $images
     */
    private function addGalleryImages(Court $court, array $images): void
    {
        $nextSortOrder = (int) $court->images()->max('sort_order') + 1;

        foreach ($images as $image) {
            $court->images()->create([
                'path' => $image->store('courts', 'public'),
                'sort_order' => $nextSortOrder++,
            ]);
        }
    }

    /**
     * Delete the selected gallery photos (files and rows) from the court.
     *
     * @param  array<int, string>  $imageIds
     */
    private function removeGalleryImages(Court $court, array $imageIds): void
    {
        if ($imageIds === []) {
            return;
        }

        $images = $court->images()->whereIn('id', $imageIds)->get();

        foreach ($images as $image) {
            Storage::disk('public')->delete($image->path);
            $image->delete();
        }
    }
}
