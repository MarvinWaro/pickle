<?php

use App\Http\Controllers\Settings\PaymentSettingsController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\ScheduleSettingsController;
use App\Http\Controllers\Settings\SecurityController;
use App\Http\Controllers\Settings\VenueSettingsController;
use Illuminate\Auth\Middleware\RequirePassword;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::redirect('settings', '/settings/profile');

    Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
});

Route::middleware(['auth', 'admin'])->group(function () {
    Route::get('settings/venue/branding', [VenueSettingsController::class, 'edit'])->name('settings.branding.edit');
    Route::put('settings/venue/branding', [VenueSettingsController::class, 'update'])->name('settings.branding.update');

    Route::get('settings/venue/payment', [PaymentSettingsController::class, 'edit'])->name('settings.payment.edit');
    Route::put('settings/venue/payment', [PaymentSettingsController::class, 'update'])->name('settings.payment.update');

    Route::get('settings/venue/schedule', [ScheduleSettingsController::class, 'edit'])->name('settings.schedule.edit');
    Route::post('settings/venue/schedule', [ScheduleSettingsController::class, 'store'])->name('settings.schedule.store');
    Route::delete('settings/venue/schedule/{closedDate}', [ScheduleSettingsController::class, 'destroy'])->name('settings.schedule.destroy');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/security', [SecurityController::class, 'edit'])
        ->middleware(RequirePassword::class)
        ->name('security.edit');

    Route::put('settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::inertia('settings/appearance', 'settings/appearance')->name('appearance.edit');
});

Route::get('.well-known/passkey-endpoints', function () {
    return response()->json([
        'enroll' => route('security.edit'),
        'manage' => route('security.edit'),
    ]);
})->name('well-known.passkeys');
