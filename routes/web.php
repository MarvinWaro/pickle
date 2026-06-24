<?php

use App\Http\Controllers\BookingController;
use App\Http\Controllers\CourtController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use Illuminate\Support\Facades\Route;

Route::get('/', [HomeController::class, 'index'])->name('home');
Route::get('courts/{court}', [CourtController::class, 'show'])->name('courts.show');

// Booking + payment is public so guests can book without an account.
Route::get('bookings/find', [BookingController::class, 'find'])->name('bookings.find');
Route::post('bookings/find', [BookingController::class, 'lookup'])->name('bookings.lookup');

Route::post('bookings', [BookingController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('bookings.store');
Route::get('bookings/{booking:reference_code}/pay', [BookingController::class, 'pay'])->name('bookings.pay');
Route::post('bookings/{booking:reference_code}/paid', [BookingController::class, 'paid'])->name('bookings.paid');
Route::post('bookings/{booking:reference_code}/cancel', [BookingController::class, 'cancel'])->name('bookings.cancel');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('courts', [CourtController::class, 'index'])->name('courts.index');
});

require __DIR__.'/admin.php';
require __DIR__.'/settings.php';
