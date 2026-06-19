<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\HotelController;
use App\Http\Controllers\AccommodationController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\TransportationController;
use App\Http\Controllers\MiscellaneousController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\TaskManagementController;
use App\Http\Controllers\KlookExpenseController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\FlipBookController;
use App\Http\Controllers\PackageController;
use App\Http\Controllers\ShortLinkController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\CrmController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\VendorController;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\BcaTransferController;
use App\Http\Controllers\CrewController;
use App\Http\Controllers\ThirdParty\WatzapController;
use App\Http\Controllers\WaChatController;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use SebastianBergmann\CodeCoverage\Report\Html\Dashboard;

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

Route::get('/json-source', [ScheduleController::class, 'jsonSource']);
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
});

Route::get('generate-inv', [DashboardController::class,'generateInv']);
Route::get('preview-file', [ScheduleController::class,'previewFile']);
Route::get('/screening', [DashboardController::class,'screening']);
Route::get('/screening-staff', [DashboardController::class,'screeningStaff']);
Route::get('/screening-success', [DashboardController::class,'screeningSuccess']);
Route::post('/twt-extractor', [BookingController::class,'twtExtractor']);
Route::get('/pdf-extractor', [BookingController::class, 'twtExtractorFileIndex'])->name('pdf-extractor.index');
Route::post('/pdf-extractor/extract', [BookingController::class, 'twtExtractorFileProcess'])->name('pdf-extractor.extract');
Route::prefix('third-party')->group(function () {
    Route::prefix('webhook')->group(function () {
        Route::post('/watzap', [WatzapController::class, 'webhook']);
        Route::get('/summary', [WatzapController::class, 'generateDailySummaries']);
    });
});
Route::get('/auto-plotting', [ScheduleController::class,'massAutoPlotting']);
Route::get('/finance/expense-manager/{id}/internal/api', [FinanceController::class, 'downloadExpense']);

Route::get('/finance/expense-manager/{id}/crew', [FinanceController::class, 'downloadExpense']);

Route::get('/booking-overview/api', [ScheduleController::class,'index']);
Route::get('/finance/rekap-hutang', [FinanceController::class, 'rekapHutang']);
Route::get('/finance/rekap-hutang/{vendorId}', [FinanceController::class, 'rekapHutangDetail']);
Route::middleware('auth')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::get('/', [DashboardController::class,'index'])->name('dashboard');
    Route::get('/portal-vendor', [DashboardController::class,'portalVendor']);
    Route::get('/google-calendar', [ScheduleController::class,'googleCalendar']);
    Route::get('/booking-overview', [ScheduleController::class,'index']);
    Route::get('/pending-booking', [ScheduleController::class,'pendingBooking']);
    Route::get('/booking-overview/kanban', [ScheduleController::class,'index']);
    Route::post('/plotting', [ScheduleController::class,'plotting']);
    Route::post('/update-booking-note', [ScheduleController::class,'updateBookingNote']);
    Route::get('/booking-list', [ScheduleController::class,'bookingList']);
    Route::get('/booking-analist', [ScheduleController::class,'bookingAnalist']);
    Route::get('/expense-package', [ExpenseController::class,'expensePackage']);
    Route::get('/expense-item', [ExpenseController::class,'expenseItem']);
    Route::get('/wa-chat', [WaChatController::class,'index']);
    Route::get('/wa-chat/{id}', [WaChatController::class,'getChatDetail']);
    Route::get('/daily-chat-summary', [WaChatController::class, 'summary'])
        ->name('daily-chat-summary');
    Route::get('/daily-chat-summary/user/{userId}/chats', [WaChatController::class, 'viewChats'])
        ->name('daily-chat-summary.view-chats');
    //data master management
    Route::get('/data-master-management/hotels', [HotelController::class,'index']);
    Route::get('/data-master-management/accommodation', [AccommodationController::class,'index']);
    Route::get('/data-master-management/activities', [ActivityController::class,'index']);
    Route::get('/data-master-management/transportation', [TransportationController::class,'index']);
    Route::get('/data-master-management/miscellaneous', [MiscellaneousController::class,'index']);
    Route::get('/data-master-management/crew', [CrewController::class,'index']);
    Route::get('/data-master-management/crew/{id}', [CrewController::class,'details']);

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
        Route::get('/details/{id}', [ScheduleController::class, 'details']);
        Route::post('/payment/{id}', [BookingController::class, 'storePayment']);
        Route::post('/payment-method/{id}', [BookingController::class, 'setPaymentMethod']);
        Route::get('/add-booking/{order_channel}', [BookingController::class, 'create']);
        Route::get('/edit-booking/{id}', [BookingController::class, 'edit']);
        Route::get('/create/{order_channel}', [BookingController::class, 'create']);
        Route::post('/', [BookingController::class, 'store']);
        Route::post('/update-bookings', [BookingController::class, 'update']);
        Route::post('/store', [BookingController::class, 'store']);
        Route::delete('/delete/{id}', [BookingController::class, 'delete']);
        Route::post('/trip-media/bulk-generate', [BookingController::class, 'bulkGenerateTripMedia']);
        Route::post('/trip-media/{id}', [BookingController::class, 'updateTripMedia']);
        Route::post('/trip-media/{id}/generate', [BookingController::class, 'generateTripMedia']);
        Route::post('/quick-update/{id}', [BookingController::class, 'quickUpdate']);
    });
    Route::prefix('vendor')->group(function () {
        Route::get('/accommodation/{id}', [VendorController::class, 'accommodation']);
        Route::post('/accommodation/update-room', [VendorController::class, 'updateRoom']);
    });

    Route::prefix('finance')->group(function () {
        Route::get('/', [FinanceController::class, 'financeManager']);
        Route::get('/receivable-income', [FinanceController::class, 'receivableIncome']);
        Route::get('/payable-report', [FinanceController::class, 'payableReportIndex']);
        Route::get('/payable-report/create', [FinanceController::class, 'payableReportCreate']);
        Route::post('/payable-report/store', [FinanceController::class, 'payableReportStore']);
        Route::get('/payable-report/details/{id}', [FinanceController::class, 'payableReportDetails']);
        Route::get('/profitability-report', [FinanceController::class, 'profitabilityReport']);
        Route::get('/transaction-log', [FinanceController::class, 'transactionLog']);
        Route::get('/expense-recap', [FinanceController::class, 'expenseRecap']);



        Route::get('/invoice-manager', [FinanceController::class, 'invoiceManager']);
        Route::get('/invoice', [FinanceController::class, 'invoice']);
        Route::get('/expense-manager', [FinanceController::class, 'expense']);
        Route::get('/expense-manager/{id}/edit', [FinanceController::class, 'editExpense']);
        Route::post('/expense-manager/{id}/update', [FinanceController::class, 'updateExpense']);
        Route::get('/expense-manager/{id}/paid', [FinanceController::class, 'downloadExpense']);
        Route::get('/expense-manager/{id}/internal', [FinanceController::class, 'downloadExpense']);
        Route::get('/expense-manager/{id}/pay-later', [FinanceController::class, 'downloadExpense']);
        Route::post('/expense-manager/{bookingId}/upload-payment-proof', [FinanceController::class, 'uploadPaymentProofExpense']);
        Route::get('/monthly-settlement', [FinanceController::class, 'settlement']);
        Route::get('/profit-loss-summary', [FinanceController::class, 'profitLoss']);
        Route::get('/rekap-hutang/export-pdf', [FinanceController::class, 'rekapHutangExportPdf']);
        Route::get('/rekap-hutang/export-excel', [FinanceController::class, 'rekapHutangExportExcel']);
        Route::get('/rekap-hutang/{vendorId}/export-pdf', [FinanceController::class, 'rekapHutangDetailExportPdf']);
        Route::get('/rekap-hutang/{vendorId}/export-excel', [FinanceController::class, 'rekapHutangDetailExportExcel']);

        // Channel Revenue Report
        Route::get('/channel-revenue-report', [FinanceController::class, 'channelReport']);
        Route::post('/channel-revenue-report/google-bill', [FinanceController::class, 'saveGoogleBill']);
        Route::post('/channel-revenue-report/channel-tag', [FinanceController::class, 'updateChannelTag']);
        Route::get('/channel-revenue-report/export-pdf/{channel}', [FinanceController::class, 'channelReportExportPdf']);
        Route::get('/channel-revenue-report/export-excel/{channel}', [FinanceController::class, 'channelReportExportExcel']);

        // BCA Crew Transfer Log
        Route::get('/bca-transfers', [BcaTransferController::class, 'index']);

        // Finance Hub
        Route::get('/hub/export-pdf',   [FinanceController::class, 'financeHubExportPdf']);
        Route::get('/hub/export-excel', [FinanceController::class, 'financeHubExportExcel']);
        Route::get('/hub', [FinanceController::class, 'financeHub'])->name('finance.hub');
        Route::get('/hub/{bookingId}/debt-items', [FinanceController::class, 'getBookingDebtItems']);
        Route::post('/hub/record-payment', [FinanceController::class, 'recordDebtPayment']);
        Route::post('/hub/{bookingId}/toggle-crew-transfer', [FinanceController::class, 'toggleCrewTransfer']);

        // Finance Cockpit
        Route::get('/cockpit/{bookingId}', [\App\Http\Controllers\Finance\FinanceCockpitController::class, 'show'])->name('finance.cockpit');
        Route::post('/cockpit/{bookingId}/crew-transfer', [\App\Http\Controllers\Finance\FinanceCockpitController::class, 'markCrewTransfer'])->name('finance.cockpit.crew-transfer');
    });
    Route::prefix('package-inventory')->group(function () {
        Route::get('/json', [PackageController::class, 'json']);
        Route::get('/create', [PackageController::class, 'create']);
        Route::put('/update/{id}', [PackageController::class, 'update']);
        Route::get('/edit/{id}', [PackageController::class, 'edit']);
        Route::post('/store', [PackageController::class, 'store']);
        Route::get('/flipbook/{url}', [PackageController::class, 'flipbook']);
        Route::get('/{order_channel}', [PackageController::class, 'index']);
        Route::get('/details/{code}', [PackageController::class, 'details']);
    });

    Route::get('/task-management', [TaskManagementController::class, 'index']);
    Route::get('/calendar', [TaskManagementController::class, 'calendar']);
    Route::get('/klook-expense-calculation', [KlookExpenseController::class, 'index']);

    Route::get('/package-detail', [PackageController::class, 'packageDetail']);

    // Client Management Routes
    Route::get('/client-management', [ClientController::class,'index']);

    // CRM Routes
    Route::get('/crm', [CrmController::class, 'index']);
    Route::get('/crm/insights', [CrmController::class, 'insights']);
    Route::get('/crm/customers', [CrmController::class, 'customers']);
    Route::get('/crm/customers/{id}/profile', [CrmController::class, 'customerProfile']);
    Route::get('/crm/export/customers', [CrmController::class, 'exportCustomers']);
    Route::get('/crm/export/countries', [CrmController::class, 'exportCountries']);
    Route::get('/crm/export/packages', [CrmController::class, 'exportPackages']);
    Route::get('/crm/export/customer-report', [CrmController::class, 'exportCustomerReport']);

    Route::resource('articles', ArticleController::class);

});

require __DIR__.'/auth.php';
require __DIR__.'/data.php';
