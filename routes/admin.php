<?php

use App\Http\Controllers\Admin\BookingController;
use App\Http\Controllers\Admin\CourtController;
use App\Http\Controllers\Admin\TimeSlotController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'admin'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::resource('courts', CourtController::class)
            ->except(['show']);

        Route::get('courts/{court}/slots', [TimeSlotController::class, 'index'])
            ->name('courts.slots.index');
        Route::post('courts/{court}/slots', [TimeSlotController::class, 'store'])
            ->name('courts.slots.store');
        Route::put('courts/{court}/slots/{slot}', [TimeSlotController::class, 'update'])
            ->name('courts.slots.update');
        Route::delete('courts/{court}/slots/{slot}', [TimeSlotController::class, 'destroy'])
            ->name('courts.slots.destroy');

        Route::get('bookings', [BookingController::class, 'index'])->name('bookings.index');
        Route::post('bookings/{booking}/confirm', [BookingController::class, 'confirm'])->name('bookings.confirm');
        Route::post('bookings/{booking}/reject', [BookingController::class, 'reject'])->name('bookings.reject');
        Route::post('bookings/{booking}/cancel', [BookingController::class, 'cancel'])->name('bookings.cancel');
    });
