<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Daftarkan CorsMiddleware untuk grup 'web'
        $middleware->web(append: [
            \App\Http\Middleware\CorsMiddleware::class, // <-- TAMBAHKAN INI
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Daftarkan CorsMiddleware untuk grup 'api'
        $middleware->api(prepend: [
            \App\Http\Middleware\CorsMiddleware::class, // <-- TAMBAHKAN INI
        ]);

        // Pindahkan konfigurasi VerifyCsrfToken ke sini agar lebih rapi
        $middleware->preventRequestsWhenReadonly(except: [
            // URI yang dikecualikan dari CSRF bisa ditambahkan di sini jika perlu
        ]);

        $middleware->validateCsrfTokens(except: [
            '/twt-extractor',
            '/third-party/webhook/watzap',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
