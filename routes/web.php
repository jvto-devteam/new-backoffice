<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\HotelController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\TaskController;
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
Route::get('/booking-list', [ScheduleController::class,'bookingList']);
Route::get('/booking-analist', [ScheduleController::class,'bookingAnalist']);
Route::get('/expense-package', [ExpenseController::class,'expensePackage']);

//data master management
Route::get('/data-master-management/hotels', [HotelController::class,'index']);
Route::get('/data-master-management/activities', [ActivityController::class,'index']);

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/task-management', [TaskController::class, 'index']);
Route::get('/calendar', [TaskController::class, 'calendar']);

require __DIR__.'/auth.php';
