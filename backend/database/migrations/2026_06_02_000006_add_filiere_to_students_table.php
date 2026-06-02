<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table): void {
            $table->enum('filiere', ['classique', 'cap'])->default('classique')->after('status');
            $table->unsignedSmallInteger('hours_objective')->default(20)->after('filiere');
            $table->string('dossier_number', 50)->nullable()->after('hours_objective');
        });
    }

    public function down(): void
    {
        Schema::table('students', function (Blueprint $table): void {
            $table->dropColumn(['filiere', 'hours_objective', 'dossier_number']);
        });
    }
};
