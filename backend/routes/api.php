<?php

use App\Domains\Identite\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API v1 Routes
|--------------------------------------------------------------------------
*/

Route::prefix('api/v1')->group(function () {
    // Auth publique avec rate limiting
    Route::prefix('auth')->group(function () {
        Route::post('login', [AuthController::class, 'login'])
            ->middleware('throttle:login');

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::get('me', [AuthController::class, 'me']);
        });
    });
});
