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
        // PERBAIKAN: Daftarkan CorsMiddleware sebagai middleware global.
        // Ini akan membuatnya berjalan untuk SEMUA permintaan (web dan api)
        // dan hanya akan dimuat sekali, sehingga memperbaiki error.
        $middleware->use([
            \App\Http\Middleware\CorsMiddleware::class,
        ]);

        // Middleware yang spesifik untuk grup 'web'
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Middleware yang spesifik untuk grup 'api' (jika ada)
        // $middleware->api(prepend: [
        //     // middleware lain untuk api bisa ditambahkan di sini
        // ]);

        // Konfigurasi pengecualian untuk CSRF Token
        $middleware->validateCsrfTokens(except: [
            '/twt-extractor',
            '/third-party/webhook/watzap',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
