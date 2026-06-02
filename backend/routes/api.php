<?php

use App\Domains\Eleves\Http\Controllers\StudentController;
use App\Domains\Examens\Http\Controllers\ExamRegistrationController;
use App\Domains\Identite\Http\Controllers\AuthController;
use App\Domains\Moniteurs\Http\Controllers\InstructorController;
use App\Domains\Planning\Http\Controllers\LessonController;
use App\Domains\Vehicules\Http\Controllers\VehicleController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API v1 Routes
|--------------------------------------------------------------------------
*/

Route::prefix('api/v1')->group(function (): void {
    // Public auth with rate limiting
    Route::prefix('auth')->group(function (): void {
        Route::post('login', [AuthController::class, 'login'])
            ->middleware('throttle:login');

        Route::middleware('auth:sanctum')->group(function (): void {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::get('me', [AuthController::class, 'me']);
        });
    });

    // Protected routes
    Route::middleware('auth:sanctum')->group(function (): void {
        // Students
        Route::apiResource('students', StudentController::class);
        Route::post('students/{student}/documents', [StudentController::class, 'uploadDocument']);
        Route::delete('students/{student}/documents/{document}', [StudentController::class, 'destroyDocument']);

        // Instructors
        Route::apiResource('instructors', InstructorController::class);

        // Vehicles
        Route::apiResource('vehicles', VehicleController::class);

        // Planning — calendar must be registered before the resource to avoid
        // "calendar" being resolved as a {lesson} route parameter
        Route::get('lessons/calendar', [LessonController::class, 'calendar']);
        Route::apiResource('lessons', LessonController::class);
        Route::patch('lessons/{lesson}/cancel', [LessonController::class, 'cancel']);
        Route::patch('lessons/{lesson}/complete', [LessonController::class, 'complete']);
        Route::patch('lessons/{lesson}/no-show', [LessonController::class, 'markNoShow']);

        // Examens — stats before resource to avoid route param ambiguity
        Route::get('exam-registrations/stats', [ExamRegistrationController::class, 'stats']);
        Route::apiResource('exam-registrations', ExamRegistrationController::class);
        Route::patch('exam-registrations/{exam_registration}/result', [ExamRegistrationController::class, 'recordResult']);
    });
});
