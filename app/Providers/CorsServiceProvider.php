<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Contracts\Http\Kernel;
use App\Middleware\CorsMiddleware;

class CorsServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(CorsMiddleware::class);
    }

    public function boot(Kernel $kernel): void
    {
        $kernel->pushMiddleware(CorsMiddleware::class);
    }
}
