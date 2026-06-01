<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            // Users
            'users.view', 'users.create', 'users.update', 'users.delete',
            // Students
            'students.view', 'students.create', 'students.update', 'students.delete',
            // Instructors
            'instructors.view', 'instructors.create', 'instructors.update', 'instructors.delete',
            // Vehicles
            'vehicles.view', 'vehicles.create', 'vehicles.update', 'vehicles.delete',
            // Planning
            'lessons.view', 'lessons.create', 'lessons.update', 'lessons.delete',
            'availabilities.view', 'availabilities.create', 'availabilities.update', 'availabilities.delete',
            // Packages & enrollments
            'packages.view', 'packages.create', 'packages.update', 'packages.delete',
            'enrollments.view', 'enrollments.create', 'enrollments.update', 'enrollments.delete',
            // Pedagogy
            'competencies.view', 'progress.view', 'progress.create', 'progress.update',
            'exams.view', 'exams.create', 'exams.update', 'exams.delete',
            // Finance
            'invoices.view', 'invoices.create', 'invoices.update', 'invoices.delete',
            'payments.view', 'payments.create',
            // Settings
            'settings.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $admin = Role::firstOrCreate(['name' => 'admin']);
        $admin->syncPermissions(Permission::all());

        $secretaire = Role::firstOrCreate(['name' => 'secretaire']);
        $secretaire->syncPermissions([
            'students.view', 'students.create', 'students.update', 'students.delete',
            'instructors.view',
            'vehicles.view', 'vehicles.create', 'vehicles.update', 'vehicles.delete',
            'lessons.view', 'lessons.create', 'lessons.update', 'lessons.delete',
            'packages.view', 'packages.create', 'packages.update',
            'enrollments.view', 'enrollments.create', 'enrollments.update',
            'exams.view', 'exams.create', 'exams.update',
            'invoices.view', 'invoices.create', 'invoices.update',
            'payments.view', 'payments.create',
        ]);

        $moniteur = Role::firstOrCreate(['name' => 'moniteur']);
        $moniteur->syncPermissions([
            'students.view',
            'lessons.view', 'lessons.update',
            'availabilities.view', 'availabilities.create', 'availabilities.update', 'availabilities.delete',
            'competencies.view', 'progress.view', 'progress.create', 'progress.update',
            'exams.view',
        ]);

        Role::firstOrCreate(['name' => 'eleve']);
    }
}
