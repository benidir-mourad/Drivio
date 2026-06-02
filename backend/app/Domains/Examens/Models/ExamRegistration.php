<?php

namespace App\Domains\Examens\Models;

use App\Domains\Eleves\Models\Student;
use Database\Factories\ExamRegistrationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ExamRegistration extends Model
{
    /** @use HasFactory<ExamRegistrationFactory> */
    use HasFactory;

    use SoftDeletes;

    protected $attributes = [
        'status' => 'planned',
    ];

    protected $fillable = [
        'student_id',
        'type',
        'center',
        'center_city',
        'scheduled_date',
        'registered_at',
        'status',
        'score',
        'notes',
    ];

    protected $casts = [
        'scheduled_date' => 'date',
        'registered_at'  => 'date',
        'score'          => 'float',
    ];

    protected static function newFactory(): ExamRegistrationFactory
    {
        return ExamRegistrationFactory::new();
    }

    /** @return BelongsTo<Student, $this> */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function isTheory(): bool
    {
        return in_array($this->type, ['theorique', 'reexamen_theorique'], true);
    }

    /** For a theory exam: pass threshold is 41/50. */
    public function isPassed(): bool
    {
        return $this->status === 'passed';
    }
}
