<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\KlookController;

Route::prefix('klook')->group(function () {
    Route::get('/supplier', [KlookController::class, 'getSupplier']);
    Route::get('/products', [KlookController::class, 'getProducts']);
    Route::get('/products/{productId}', [KlookController::class, 'getProduct']);
    Route::post('/availability', [KlookController::class, 'checkAvailability']);
    Route::post('/bookings', [KlookController::class, 'createBooking']);
    Route::get('/bookings/{bookingId}', [KlookController::class, 'getBooking']);
    Route::get('/bookings', [KlookController::class, 'getBookings']);
    Route::post('/bookings/{bookingId}/cancel', [KlookController::class, 'cancelBooking']);
});
