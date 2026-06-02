<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table): void {
            $table->id();
            $table->string('plate_number', 20)->unique();
            $table->string('brand', 100);
            $table->string('model', 100);
            $table->smallInteger('year');
            $table->enum('license_category', ['A', 'A1', 'A2', 'AM', 'B', 'B1', 'C', 'D'])->default('B');
            $table->enum('fuel_type', ['essence', 'diesel', 'electrique', 'hybride'])->default('essence');
            $table->enum('status', ['available', 'maintenance', 'retired'])->default('available');
            $table->unsignedInteger('mileage')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
