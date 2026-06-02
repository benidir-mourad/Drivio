<?php

namespace App\Domains\Eleves\Models;

use App\Domains\Examens\Models\ExamRegistration;
use App\Domains\Planning\Models\Lesson;
use App\Models\User;
use Database\Factories\StudentFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Student extends Model
{
    /** @use HasFactory<StudentFactory> */
    use HasFactory;

    use SoftDeletes;

    protected static function newFactory(): StudentFactory
    {
        return StudentFactory::new();
    }

    protected $fillable = [
        'user_id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'address',
        'date_of_birth',
        'license_category',
        'enrollment_date',
        'status',
        'filiere',
        'hours_objective',
        'dossier_number',
        'notes',
    ];

    protected $casts = [
        'date_of_birth'   => 'date',
        'enrollment_date' => 'date',
        'hours_objective' => 'integer',
    ];

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<StudentDocument, $this> */
    public function documents(): HasMany
    {
        return $this->hasMany(StudentDocument::class);
    }

    /** @return HasMany<Lesson, $this> */
    public function lessons(): HasMany
    {
        return $this->hasMany(Lesson::class);
    }

    /** @return HasMany<ExamRegistration, $this> */
    public function examRegistrations(): HasMany
    {
        return $this->hasMany(ExamRegistration::class);
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    /** Total driving hours completed (lessons with status completed or no_show). */
    public function getHoursCompletedAttribute(): float
    {
        return round(
            $this->lessons()
                ->whereIn('status', ['completed', 'no_show'])
                ->whereIn('type', ['conduite', 'accompagnement', 'bilan', 'examen_blanc'])
                ->get()
                ->sum(fn (Lesson $l) => $l->duration_minutes) / 60,
            1
        );
    }
}
