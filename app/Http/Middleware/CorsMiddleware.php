<?php

namespace App\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CorsMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $allowedOrigins = [
            'https://jv-to.com',
            'https://archive-pathfinder.javavolcano-touroperator.com',
            'https://travelhub.javavolcano-touroperator.com',
        ];

        $origin = $request->header('Origin');

        // Jika origin ada dalam daftar yang diizinkan
        if (in_array($origin, $allowedOrigins)) {
            // Tangani preflight request (OPTIONS)
            if ($request->isMethod('OPTIONS')) {
                return response()->json('CORS Preflight OK', 200, [
                    'Access-Control-Allow-Origin' => $origin,
                    'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers' => 'Content-Type, Authorization, X-Requested-With',
                    'Access-Control-Allow-Credentials' => 'true',
                ]);
            }

            // Tangani request utama
            $response = $next($request);
            $response->headers->set('Access-Control-Allow-Origin', $origin);
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
            $response->headers->set('Access-Control-Allow-Credentials', 'true');

            return $response;
        }

        return $next($request);
    }
}
