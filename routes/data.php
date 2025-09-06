<?php

use App\Http\Controllers\ExportData\ExportDataCountries;
use App\Http\Controllers\ExportData\ExportDataCrew;
use App\Http\Controllers\ExportData\ExportDataCustomer;
use App\Http\Controllers\ExportData\ExportDataDestinations;
use App\Http\Controllers\ExportData\ExportDataHotel;
use App\Http\Controllers\ExportData\ExportDataVehicles;
use App\Http\Controllers\ExportDataController;
use Illuminate\Support\Facades\Route;

Route::prefix('export-data')->group(function () {
    Route::prefix('hotels')->group(function () {
        Route::get('/hotels', [ExportDataHotel::class, 'hotels']);
        Route::get('/room-types', [ExportDataHotel::class, 'roomTypes']);
    });
    Route::prefix('vehicles')->group(function () {
        Route::get('/vehicle-types', [ExportDataVehicles::class, 'vehicleTypes']);
        Route::get('/vehicle-units', [ExportDataVehicles::class, 'vehicleUnits']);
    });
    Route::prefix('crews')->group(function () {
        Route::get('/crew-roles', [ExportDataCrew::class, 'crewRoles']);
        Route::get('/crew-member', [ExportDataCrew::class, 'crewMember']);
    });
    Route::prefix('destinations')->group(function () {
        Route::get('/destinations', [ExportDataDestinations::class, 'destinations']);
    });
    Route::prefix('countries')->group(function () {
        Route::get('/countries', [ExportDataCountries::class, 'countries']);
    });
    Route::prefix('customers')->group(function () {
        Route::get('/customers', [ExportDataCustomer::class, 'customers']);
    });
});

