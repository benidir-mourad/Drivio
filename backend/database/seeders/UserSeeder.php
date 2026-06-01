<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'name'      => 'Admin Drivio',
                'email'     => 'admin@drivio.fr',
                'password'  => Hash::make('password'),
                'is_active' => true,
                'role'      => 'admin',
            ],
            [
                'name'      => 'Sophie Secrétaire',
                'email'     => 'secretaire@drivio.fr',
                'password'  => Hash::make('password'),
                'is_active' => true,
                'role'      => 'secretaire',
            ],
            [
                'name'      => 'Marc Moniteur',
                'email'     => 'moniteur@drivio.fr',
                'password'  => Hash::make('password'),
                'is_active' => true,
                'role'      => 'moniteur',
            ],
            [
                'name'      => 'Élève Demo',
                'email'     => 'eleve@drivio.fr',
                'password'  => Hash::make('password'),
                'is_active' => true,
                'role'      => 'eleve',
            ],
        ];

        foreach ($users as $data) {
            $role = $data['role'];
            unset($data['role']);

            $user = User::updateOrCreate(['email' => $data['email']], $data);
            $user->syncRoles([$role]);
        }
    }
}
