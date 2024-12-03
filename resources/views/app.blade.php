<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta property="og:type" content="article" />
        <meta property="og:title" content="New Back Office JVTO" />
        <meta property="og:description" content="Welcome to New Back Office JVTO" />
        <meta property="og:url" content="https://new-backoffice.javavolcano-touroperator.com/" />
        <meta property="og:image" content="https://javavolcano-touroperator.com/assets/img/download.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="627" />
        <link rel="manifest" href="/manifest.json">        

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
