<?php

namespace App\Domains\Planning\Models;

use App\Domains\Eleves\Models\Student;
use App\Domains\Moniteurs\Models\Instructor;
use App\Domains\Vehicules\Models\Vehicle;
use Database\Factories\LessonFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lesson extends Model
{
    /** @use HasFactory<LessonFactory> */
    use HasFactory;

    use SoftDeletes;

    protected $fillable = [
        'student_id',
        'instructor_id',
        'vehicle_id',
        'type',
        'starts_at',
        'ends_at',
        'status',
        'cancellation_reason',
        'notes',
    ];

    protected $attributes = [
        'status' => 'scheduled',
    ];

    protected $casts = [
        'starts_at' => 'datetime',
        'ends_at'   => 'datetime',
    ];

    protected static function newFactory(): LessonFactory
    {
        return LessonFactory::new();
    }

    /** @return BelongsTo<Student, $this> */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    /** @return BelongsTo<Instructor, $this> */
    public function instructor(): BelongsTo
    {
        return $this->belongsTo(Instructor::class);
    }

    /** @return BelongsTo<Vehicle, $this> */
    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function getDurationMinutesAttribute(): int
    {
        return (int) $this->starts_at->diffInMinutes($this->ends_at);
    }
}
