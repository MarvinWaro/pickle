<?php

use App\Models\Amenity;
use App\Models\Court;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

function admin(): User
{
    return User::factory()->create(['role' => 'admin']);
}

test('guests are redirected from the courts admin', function () {
    $this->get(route('admin.courts.index'))->assertRedirect(route('login'));
});

test('non-admin users are forbidden from the courts admin', function () {
    $this->actingAs(User::factory()->create(['role' => 'user']))
        ->get(route('admin.courts.index'))
        ->assertForbidden();
});

test('admins can view the courts index', function () {
    Court::factory()->count(2)->create();

    $this->actingAs(admin())
        ->get(route('admin.courts.index'))
        ->assertOk();
});

test('admins can create a court with an image and amenities', function () {
    Storage::fake('public');

    $response = $this->actingAs(admin())->post(route('admin.courts.store'), [
        'name' => 'Center Court',
        'description' => 'Premium indoor court',
        'surface' => 'Indoor',
        'price_per_hour' => '350.50',
        'is_active' => true,
        'amenities' => ['Showers', 'Parking'],
        'image' => UploadedFile::fake()->image('court.jpg'),
    ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.courts.index'));

    $court = Court::firstWhere('name', 'Center Court');

    expect($court)->not->toBeNull();
    expect($court->price_per_hour)->toBe('350.50');
    expect($court->image_path)->not->toBeNull();
    expect($court->amenities->pluck('name')->all())->toEqualCanonicalizing(['Showers', 'Parking']);

    Storage::disk('public')->assertExists($court->image_path);
});

test('creating a court requires a name and price', function () {
    $this->actingAs(admin())
        ->from(route('admin.courts.create'))
        ->post(route('admin.courts.store'), [
            'name' => '',
            'price_per_hour' => '',
        ])
        ->assertSessionHasErrors(['name', 'price_per_hour']);
});

test('amenities are reused and not duplicated across courts', function () {
    $admin = admin();

    $this->actingAs($admin)->post(route('admin.courts.store'), [
        'name' => 'Court One',
        'price_per_hour' => '200',
        'amenities' => ['Parking'],
    ]);

    $this->actingAs($admin)->post(route('admin.courts.store'), [
        'name' => 'Court Two',
        'price_per_hour' => '200',
        'amenities' => ['Parking'],
    ]);

    expect(Amenity::where('name', 'Parking')->count())->toBe(1);
});

test('admins can update a court and sync amenities', function () {
    $court = Court::factory()->create(['name' => 'Old Name']);
    $court->amenities()->attach(Amenity::factory()->create(['name' => 'Lighting']));

    $response = $this->actingAs(admin())->put(route('admin.courts.update', $court), [
        'name' => 'New Name',
        'price_per_hour' => '420',
        'is_active' => false,
        'amenities' => ['Showers'],
    ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.courts.index'));

    $court->refresh();

    expect($court->name)->toBe('New Name');
    expect($court->is_active)->toBeFalse();
    expect($court->amenities->pluck('name')->all())->toBe(['Showers']);
});

test('admins can create a court with gallery photos', function () {
    Storage::fake('public');

    $this->actingAs(admin())->post(route('admin.courts.store'), [
        'name' => 'Gallery Court',
        'price_per_hour' => '300',
        'images' => [
            UploadedFile::fake()->image('angle-1.jpg'),
            UploadedFile::fake()->image('angle-2.jpg'),
        ],
    ])->assertSessionHasNoErrors();

    $court = Court::firstWhere('name', 'Gallery Court');

    expect($court->images)->toHaveCount(2);

    foreach ($court->images as $image) {
        Storage::disk('public')->assertExists($image->path);
    }
});

test('a court gallery cannot exceed five photos', function () {
    $court = Court::factory()->create();

    $this->actingAs(admin())
        ->from(route('admin.courts.edit', $court))
        ->put(route('admin.courts.update', $court), [
            'name' => $court->name,
            'price_per_hour' => '300',
            'images' => [
                UploadedFile::fake()->image('1.jpg'),
                UploadedFile::fake()->image('2.jpg'),
                UploadedFile::fake()->image('3.jpg'),
                UploadedFile::fake()->image('4.jpg'),
                UploadedFile::fake()->image('5.jpg'),
                UploadedFile::fake()->image('6.jpg'),
            ],
        ])
        ->assertSessionHasErrors('images');
});

test('admins can remove a gallery photo on update', function () {
    Storage::fake('public');

    $court = Court::factory()->create();
    $image = $court->images()->create([
        'path' => UploadedFile::fake()->image('angle.jpg')->store('courts', 'public'),
        'sort_order' => 1,
    ]);

    $this->actingAs(admin())->put(route('admin.courts.update', $court), [
        'name' => $court->name,
        'price_per_hour' => '300',
        'removed_image_ids' => [$image->id],
    ])->assertSessionHasNoErrors();

    expect($court->fresh()->images)->toHaveCount(0);
    Storage::disk('public')->assertMissing($image->path);
});

test('admins can delete a court and its image', function () {
    Storage::fake('public');

    $court = Court::factory()->create([
        'image_path' => UploadedFile::fake()->image('court.jpg')->store('courts', 'public'),
    ]);

    Storage::disk('public')->assertExists($court->image_path);

    $this->actingAs(admin())
        ->delete(route('admin.courts.destroy', $court))
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('admin.courts.index'));

    expect(Court::find($court->id))->toBeNull();
    Storage::disk('public')->assertMissing($court->image_path);
});
