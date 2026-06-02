<?php

use App\Domains\Eleves\Models\Student;
use App\Domains\Moniteurs\Models\Instructor;
use App\Domains\Planning\Models\Lesson;
use App\Models\User;

test('student show includes hours_completed when lessons are loaded', function (): void {
    $admin      = User::factory()->create()->assignRole('admin');
    $student    = Student::factory()->create(['hours_objective' => 20]);
    $instructor = Instructor::factory()->create();

    // 2 completed conduite lessons of 1h each
    Lesson::factory()->count(2)->create([
        'student_id'    => $student->id,
        'instructor_id' => $instructor->id,
        'starts_at'     => '2030-01-10 09:00',
        'ends_at'       => '2030-01-10 10:00',
        'type'          => 'conduite',
        'status'        => 'completed',
    ]);

    // 1 scheduled lesson that should NOT count
    Lesson::factory()->create([
        'student_id'    => $student->id,
        'instructor_id' => $instructor->id,
        'starts_at'     => '2030-01-11 09:00',
        'ends_at'       => '2030-01-11 10:00',
        'type'          => 'conduite',
        'status'        => 'scheduled',
    ]);

    $this->actingAs($admin)
        ->getJson("/api/v1/students/{$student->id}")
        ->assertOk()
        ->assertJsonPath('data.hours_completed', 2)
        ->assertJsonPath('data.hours_objective', 20)
        ->assertJsonPath('data.filiere', 'classique');
});

test('code lessons are excluded from hours_completed', function (): void {
    $admin      = User::factory()->create()->assignRole('admin');
    $student    = Student::factory()->create();
    $instructor = Instructor::factory()->create();

    Lesson::factory()->create([
        'student_id'    => $student->id,
        'instructor_id' => $instructor->id,
        'starts_at'     => '2030-02-01 09:00',
        'ends_at'       => '2030-02-01 10:00',
        'type'          => 'code',
        'status'        => 'completed',
    ]);

    $this->actingAs($admin)
        ->getJson("/api/v1/students/{$student->id}")
        ->assertOk()
        ->assertJsonPath('data.hours_completed', 0);
});

test('no_show lessons count toward hours_completed', function (): void {
    $admin      = User::factory()->create()->assignRole('admin');
    $student    = Student::factory()->create();
    $instructor = Instructor::factory()->create();

    Lesson::factory()->create([
        'student_id'    => $student->id,
        'instructor_id' => $instructor->id,
        'starts_at'     => '2030-03-01 09:00',
        'ends_at'       => '2030-03-01 10:00',
        'type'          => 'conduite',
        'status'        => 'no_show',
    ]);

    $this->actingAs($admin)
        ->getJson("/api/v1/students/{$student->id}")
        ->assertOk()
        ->assertJsonPath('data.hours_completed', 1);
});

test('student can have filiere cap with 6h objective', function (): void {
    $admin   = User::factory()->create()->assignRole('admin');
    $student = Student::factory()->create();

    $this->actingAs($admin)
        ->putJson("/api/v1/students/{$student->id}", [
            'filiere'         => 'cap',
            'hours_objective' => 6,
        ])
        ->assertOk()
        ->assertJsonPath('data.filiere', 'cap')
        ->assertJsonPath('data.hours_objective', 6);
});

test('student store accepts new filiere fields', function (): void {
    $admin = User::factory()->create()->assignRole('admin');

    $this->actingAs($admin)
        ->postJson('/api/v1/students', [
            'first_name'       => 'Tom',
            'last_name'        => 'Dupont',
            'email'            => 'tom.dupont@example.be',
            'license_category' => 'B',
            'enrollment_date'  => '2026-09-01',
            'filiere'          => 'cap',
            'hours_objective'  => 6,
            'dossier_number'   => 'GOCA-2026-0042',
        ])
        ->assertCreated()
        ->assertJsonPath('data.filiere', 'cap')
        ->assertJsonPath('data.dossier_number', 'GOCA-2026-0042');
});
