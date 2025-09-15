<?php

use App\Http\Controllers\ExportData\ExportDataAddons;
use App\Http\Controllers\ExportData\ExportDataAllController;
use App\Http\Controllers\ExportData\ExportDataCountries;
use App\Http\Controllers\ExportData\ExportDataCrew;
use App\Http\Controllers\ExportData\ExportDataCustomer;
use App\Http\Controllers\ExportData\ExportDataDestinations;
use App\Http\Controllers\ExportData\ExportDataHotel;
use App\Http\Controllers\ExportData\ExportDataPackage;
use App\Http\Controllers\ExportData\ExportDataPriceTiers;
use App\Http\Controllers\ExportData\ExportDataVehicles;
use App\Http\Controllers\ExportData\ExportIncludeExclude;
use App\Http\Controllers\ExportData\ExportDataActivities;
use App\Http\Controllers\ExportData\ExportDataPolicies;
use App\Http\Controllers\ExportDataController;
use Illuminate\Support\Facades\Route;

Route::prefix('export-data')->group(function () {
    Route::prefix('hotels')->group(function () {
        Route::get('/hotels', [ExportDataHotel::class, 'hotels']);
        Route::get('/room-types', [ExportDataHotel::class, 'roomTypes']);
        Route::get('/room-configurations', [ExportDataHotel::class, 'roomConfigurations']);
    });
    Route::prefix('vehicles')->group(function () {
        Route::get('/vehicle-types', [ExportDataVehicles::class, 'vehicleTypes']);
        Route::get('/vehicle-units', [ExportDataVehicles::class, 'vehicleUnits']);
    });
    Route::prefix('crews')->group(function () {
        Route::get('/crew-roles', [ExportDataCrew::class, 'crewRoles']);
        Route::get('/crew-member', [ExportDataCrew::class, 'crewMember']);
        Route::get('/crew-member-roles', [ExportDataCrew::class, 'crewMemberRoles']);
        Route::get('/transport-crew-rules', [ExportDataCrew::class, 'transportCrewRules']);
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
        Route::get('/package-addons', [ExportDataPackage::class, 'packageAddons']);
        Route::get('/package-prices', [ExportDataPackage::class, 'packagePrices']);
        Route::get('/package-itinerary-days', [ExportDataPackage::class, 'packageItineraryDays']);
        Route::get('/package-itinerary-day-details', [ExportDataPackage::class, 'packageItineraryDayDetails']);
        Route::get('/package-destinations', [ExportDataPackage::class, 'packageDestinations']);
        Route::get('/package-hotel-options', [ExportDataPackage::class, 'packageHotelOptions']);
    });
    Route::prefix('include-exclude')->group(function () {
        Route::get('/item-includes', [ExportIncludeExclude::class, 'include']);
        Route::get('/item-excludes', [ExportIncludeExclude::class, 'exclude']);
    });
    Route::prefix('addons')->group(function () {
        Route::get('/addons', [ExportDataAddons::class, 'addons']);
    });
    Route::prefix('price-tiers')->group(function () {
        Route::get('/price-tiers', [ExportDataPriceTiers::class, 'priceTiers']);
    });
    Route::prefix('activities')->group(function () {
        Route::get('/activities', [ExportDataActivities::class, 'activities']);
        Route::get('/activity_categories', [ExportDataActivities::class, 'activity_categories']);
    });
    Route::prefix('policies')->group(function () {
        Route::get('/policies', [ExportDataPolicies::class, 'policies']);
    });
    Route::get('/all', [ExportDataAllController::class, 'all']);
});