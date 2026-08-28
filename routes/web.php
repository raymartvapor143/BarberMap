<?php

use Illuminate\Support\Facades\Route;

// Single Page Application entrypoint for all non-api web routes
Route::get('/{any}', function () {
    return view('index');
})->where('any', '.*');
