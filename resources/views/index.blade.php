<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="dark">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>{{ config('app.name', 'BarberMap') }} — Map-First Barber Shop Discovery & Reservations</title>
    <meta name="description" content="Discover top-rated local barber shops on an interactive map, explore haircut portfolios, browse services and book appointments instantly on BarberMap.">

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap" rel="stylesheet">
    
    <!-- Leaflet CSS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />

    <!-- Vite Assets -->
    @vite(['resources/css/app.css', 'resources/js/index.jsx'])
</head>
<body class="bg-[#0b0d11] text-slate-100 min-h-screen antialiased selection:bg-amber-500/30 selection:text-amber-300">
    <div id="root" class="min-h-screen flex flex-col"></div>
</body>
</html>
