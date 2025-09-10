<?php

use App\Http\Controllers\ExportData\ExportDataCountries;
use App\Http\Controllers\ExportData\ExportDataCrew;
use App\Http\Controllers\ExportData\ExportDataCustomer;
use App\Http\Controllers\ExportData\ExportDataDestinations;
use App\Http\Controllers\ExportData\ExportDataHotel;
use App\Http\Controllers\ExportData\ExportDataPackage;
use App\Http\Controllers\ExportData\ExportDataVehicles;
use App\Http\Controllers\ExportData\ExportIncludeExclude;
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
        Route::get('/crew-member-roles', [ExportDataCrew::class, 'crewMemberRoles']);
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
    Route::prefix('packages')->group(function () {
        Route::get('/package-categories', [ExportDataPackage::class, 'packageCategories']);
        Route::get('/packages', [ExportDataPackage::class, 'packages']);
        Route::get('/package-images', [ExportDataPackage::class, 'packageImages']);
        Route::get('/package-includes', [ExportDataPackage::class, 'packageIncludes']);
        Route::get('/package-excludes', [ExportDataPackage::class, 'packageExcludes']);
    });
    Route::prefix('include-exclude')->group(function () {
        Route::get('/item-includes', [ExportIncludeExclude::class, 'include']);
        Route::get('/item-excludes', [ExportIncludeExclude::class, 'exclude']);
    });
});

