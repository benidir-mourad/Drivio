<?php

namespace App\Domains\Planning\Http\Requests;

use App\Domains\Planning\Models\Lesson;
use Illuminate\Foundation\Http\FormRequest;

class StoreLessonRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Lesson::class);
    }

    public function rules(): array
    {
        return [
            'student_id'    => ['required', 'exists:students,id'],
            'instructor_id' => ['required', 'exists:instructors,id'],
            'vehicle_id'    => ['nullable', 'exists:vehicles,id'],
            'type'          => ['required', 'in:conduite,code,accompagnement,bilan,examen_blanc'],
            'starts_at'     => ['required', 'date'],
            'ends_at'       => ['required', 'date', 'after:starts_at'],
            'notes'         => ['nullable', 'string'],
        ];
    }
}
