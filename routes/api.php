<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\KlookController;
use App\Http\Controllers\Api\FileController;
use App\Http\Controllers\Api\FileTypeController;
use App\Http\Controllers\Api\FolderController;
use App\Http\Controllers\Api\FolderTypeController;
use App\Http\Controllers\Api\TagController;
use Illuminate\Http\Request;

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

Route::prefix('v1')->group(function () {

    // Folder Type Routes
    Route::apiResource('folder-types', FolderTypeController::class);

    // File Type Routes
    Route::apiResource('file-types', FileTypeController::class);

    // Tag Routes
    Route::apiResource('tags', TagController::class);

    // Folder Routes
    Route::get('folders/tree', [FolderController::class, 'tree']);
    Route::get('folders/{id}/contents', [FolderController::class, 'contents']);
    Route::put('folders/{id}/move', [FolderController::class, 'move']);
    Route::apiResource('folders', FolderController::class);

    // File Routes
    Route::get('files/search', [FileController::class, 'search']);
    Route::get('files/{id}/download', [FileController::class, 'download']);
    Route::put('files/{id}/move', [FileController::class, 'move']);
    Route::put('files/{id}/metadata', [FileController::class, 'updateMetadata']);
    Route::post('folders/{folderId}/files', [FileController::class, 'store']);
    Route::apiResource('files', FileController::class)->except(['store']);

    // File Tags Routes
    Route::get('files/{fileId}/tags', [TagController::class, 'getFileTags']);
    Route::post('files/{fileId}/tags', [TagController::class, 'addTagToFile']);
    Route::put('files/{fileId}/tags', [TagController::class, 'setFileTags']);
    Route::delete('files/{fileId}/tags/{tagId}', [TagController::class, 'removeTagFromFile']);
});
