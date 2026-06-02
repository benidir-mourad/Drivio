<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exam_registrations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('student_id')->constrained()->restrictOnDelete();
            $table->enum('type', ['theorique', 'pratique', 'reexamen_theorique', 'reexamen_pratique']);
            $table->enum('center', ['goca', 'autosecure', 'car', 'other'])->nullable();
            $table->string('center_city', 100)->nullable();
            $table->date('scheduled_date')->nullable();
            $table->date('registered_at')->nullable();
            $table->enum('status', ['planned', 'passed', 'failed', 'absent', 'cancelled'])->default('planned');
            // For theorique: score out of 50 (pass threshold: 41)
            $table->decimal('score', 4, 1)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['student_id', 'type', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_registrations');
    }
};
