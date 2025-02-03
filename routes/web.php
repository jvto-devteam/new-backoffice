<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\HotelController;
use App\Http\Controllers\AccommodationController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\TaskManagementController;
use App\Http\Controllers\KlookExpenseController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\FlipBookController;
use App\Http\Controllers\PackageController;
use App\Http\Controllers\ShortLinkController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\FinanceController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Route::get('/', function () {
//     return Inertia::render('Welcome', [
//         'canLogin' => Route::has('login'),
//         'canRegister' => Route::has('register'),
//         'laravelVersion' => Application::VERSION,
//         'phpVersion' => PHP_VERSION,
//     ]);
// });

// Route::get('/dashboard', function () {
//     return Inertia::render('Dashboard');
// })->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/', [DashboardController::class,'index']);
Route::get('/booking-overview', [ScheduleController::class,'index']);
Route::post('/plotting', [ScheduleController::class,'plotting']);
Route::get('/booking-list', [ScheduleController::class,'bookingList']);
Route::get('/booking-analist', [ScheduleController::class,'bookingAnalist']);
Route::get('/expense-package', [ExpenseController::class,'expensePackage']);
Route::get('/expense-item', [ExpenseController::class,'expenseItem']);

//data master management
Route::get('/data-master-management/hotels', [HotelController::class,'index']);
Route::get('/data-master-management/accommodation', [AccommodationController::class,'index']);
Route::get('/data-master-management/activities', [ActivityController::class,'index']);


Route::get('/short-link', [ShortLinkController::class,'index']);
Route::post('/short-link/store', [ShortLinkController::class,'store']);
Route::delete('/short-link/{id}', [ShortLinkController::class, 'destroy'])->name('short-link.destroy');
Route::put('/short-link/{id}', [ShortLinkController::class, 'update'])->name('short-link.update');
Route::prefix('generator')->group(function () {
    Route::get('/flipbook', [FlipBookController::class,'index']);
    Route::post('/flipbook/store', [FlipBookController::class,'store']);
    Route::delete('/flipbook/{id}', [FlipBookController::class, 'destroy']);
    Route::put('/flipbook/{id}', [FlipBookController::class, 'update']);

    Route::get('/short-link', [ShortLinkController::class,'index']);
    Route::post('/short-link/store', [ShortLinkController::class,'store']);
    Route::delete('/short-link/{id}', [ShortLinkController::class, 'destroy']);
    Route::put('/short-link/{id}', [ShortLinkController::class, 'update']);
});

Route::prefix('bookings')->group(function () {
    Route::get('/create/{order_channel}', [BookingController::class, 'create']);
    Route::post('/store', [BookingController::class, 'store']);
});

Route::prefix('finance')->group(function () {
    Route::get('/invoice-manager', [FinanceController::class, 'invoice']);
    Route::get('/expense-manager', [FinanceController::class, 'expense']);
    Route::get('/expense-manager/{id}/edit', [FinanceController::class, 'editExpense']);
    Route::get('/monthly-settlement', [FinanceController::class, 'settlement']);
    Route::get('/profit-loss-summary', [FinanceController::class, 'profitLoss']);
});
Route::prefix('package-inventory')->group(function () {
    Route::get('/flipbook/{url}', [PackageController::class, 'flipbook']);
    Route::get('/{order_channel}', [PackageController::class, 'index']);
});
Route::middleware('auth')->group(function () {
    Route::get('/profile', [PackageController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/task-management', [TaskManagementController::class, 'index']);
Route::get('/calendar', [TaskManagementController::class, 'calendar']);
Route::get('/klook-expense-calculation', [KlookExpenseController::class, 'index']);

Route::get('/package-detail', [PackageController::class, 'packageDetail']);

// Client Management Routes
Route::get('/client-management', [ClientController::class,'index']);

require __DIR__.'/auth.php';
