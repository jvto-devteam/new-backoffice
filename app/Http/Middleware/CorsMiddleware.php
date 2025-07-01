<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CorsMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Daftar origin yang diizinkan. Lebih baik diletakkan di file config/cors.php
        $allowedOrigins = [
            'https://jv-to.com',
            'https://archive-pathfinder.javavolcano-touroperator.com',
            'https://travelhub.javavolcano-touroperator.com',
            'https://sam-app.javavolcano-touroperator.com',
            'https://47d7-36-73-181-2.ngrok-free.app',
            // Tambahkan origin lain jika perlu, misalnya untuk development
            // 'http://localhost:3000',
        ];

        $origin = $request->header('Origin');

        // PERBAIKAN 1: Hanya proses jika origin ada di dalam daftar yang diizinkan.
        if ($origin && in_array($origin, $allowedOrigins)) {
            
            // Tangani preflight request (OPTIONS)
            if ($request->isMethod('OPTIONS')) {
                // PERBAIKAN 2: Gunakan status 204 No Content, ini lebih standar untuk preflight.
                // Dan tidak perlu mengirim body JSON.
                return response('', 204, [
                    'Access-Control-Allow-Origin'      => $origin,
                    'Access-Control-Allow-Methods'     => 'POST, GET, OPTIONS, PUT, DELETE',
                    'Access-Control-Allow-Headers'     => 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token',
                    'Access-Control-Allow-Credentials' => 'true',
                    'Access-Control-Max-Age'           => '86400', // Cache preflight selama 1 hari
                ]);
            }

            // Untuk request selain OPTIONS, lanjutkan ke aplikasi dan tambahkan header ke responsnya.
            $response = $next($request);
            
            $response->headers->set('Access-Control-Allow-Origin', $origin);
            $response->headers->set('Access-Control-Allow-Credentials', 'true');

            return $response;
        }

        // Jika origin tidak diizinkan, langsung lanjutkan tanpa menambahkan header CORS.
        // Laravel akan menanganinya (biasanya dengan error, yang mana sudah benar).
        return $next($request);
    }
}
