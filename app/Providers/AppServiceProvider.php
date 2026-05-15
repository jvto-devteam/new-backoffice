<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        if (env(key: 'APP_ENV') !=='local') {
            URL::forceScheme(scheme:'https');
          }
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Debt-related model observers — auto-sync booking expense totals
        \App\Models\BookHotel::observe(\App\Observers\BookHotelObserver::class);
        \App\Models\BookDestinationActivity::observe(\App\Observers\BookDestinationActivityObserver::class);
        \App\Models\BookCarActivity::observe(\App\Observers\BookCarActivityObserver::class);
        \App\Models\BookCrewActivity::observe(\App\Observers\BookCrewActivityObserver::class);
        \App\Models\BookOthersActivity::observe(\App\Observers\BookOthersActivityObserver::class);
        \App\Models\DebtPaymentDetail::observe(\App\Observers\DebtPaymentDetailObserver::class);
    }
}
