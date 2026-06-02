<?php

namespace App\Providers;

use App\Domains\Eleves\Models\Student;
use App\Domains\Eleves\Policies\StudentPolicy;
use App\Domains\Moniteurs\Models\Instructor;
use App\Domains\Moniteurs\Policies\InstructorPolicy;
use App\Domains\Planning\Models\Lesson;
use App\Domains\Planning\Policies\LessonPolicy;
use App\Domains\Vehicules\Models\Vehicle;
use App\Domains\Vehicules\Policies\VehiclePolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        // Fix for MySQL < 5.7.7 / MariaDB < 10.2.2 key length limit
        Schema::defaultStringLength(191);

        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        Gate::policy(Student::class, StudentPolicy::class);
        Gate::policy(Instructor::class, InstructorPolicy::class);
        Gate::policy(Vehicle::class, VehiclePolicy::class);
        Gate::policy(Lesson::class, LessonPolicy::class);
    }
}
