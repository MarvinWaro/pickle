<?php

use App\Models\Setting;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('a regular user cannot access venue settings', function () {
    $this->actingAs(User::factory()->create(['role' => 'user']))
        ->get(route('settings.branding.edit'))
        ->assertForbidden();
});

test('an admin can view branding settings', function () {
    $this->actingAs(User::factory()->create(['role' => 'admin']))
        ->get(route('settings.branding.edit'))
        ->assertOk();
});

test('an admin can update branding with a logo', function () {
    Storage::fake('public');

    $this->actingAs(User::factory()->create(['role' => 'admin']))
        ->put(route('settings.branding.update'), [
            'venue_name' => 'My Venue',
            'contact_email' => 'hello@venue.test',
            'logo' => UploadedFile::fake()->image('logo.png'),
        ])
        ->assertSessionHasNoErrors();

    expect(Setting::get('venue_name'))->toBe('My Venue');
    expect(Setting::get('venue_logo_path'))->not->toBeNull();
    Storage::disk('public')->assertExists(Setting::get('venue_logo_path'));
});

test('an admin can update payment settings including a QR', function () {
    Storage::fake('public');

    $this->actingAs(User::factory()->create(['role' => 'admin']))
        ->put(route('settings.payment.update'), [
            'payment_method' => 'GCash',
            'payment_account_name' => 'Juan Dela Cruz',
            'payment_account_number' => '09171234567',
            'messenger_link' => 'https://m.me/mypage',
            'hold_minutes' => '10',
            'payment_qr' => UploadedFile::fake()->image('qr.png'),
        ])
        ->assertSessionHasNoErrors();

    expect(Setting::get('payment_method'))->toBe('GCash');
    expect(Setting::get('hold_minutes'))->toBe('10');
    expect(Setting::get('messenger_link'))->toBe('https://m.me/mypage');
    Storage::disk('public')->assertExists(Setting::get('payment_qr_path'));
});

test('a regular user cannot update payment settings', function () {
    $this->actingAs(User::factory()->create(['role' => 'user']))
        ->put(route('settings.payment.update'), ['hold_minutes' => '5'])
        ->assertForbidden();
});

test('the messenger link must be a valid url', function () {
    $this->actingAs(User::factory()->create(['role' => 'admin']))
        ->from(route('settings.payment.edit'))
        ->put(route('settings.payment.update'), [
            'hold_minutes' => '5',
            'messenger_link' => 'not-a-url',
        ])
        ->assertSessionHasErrors('messenger_link');
});
