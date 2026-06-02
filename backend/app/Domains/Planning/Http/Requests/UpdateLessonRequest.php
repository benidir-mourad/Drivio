<?php

namespace App\Domains\Planning\Http\Requests;

use App\Domains\Planning\Models\Lesson;
use Illuminate\Foundation\Http\FormRequest;

class UpdateLessonRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Lesson $lesson */
        $lesson = $this->route('lesson');

        return $this->user()->can('update', $lesson);
    }

    public function rules(): array
    {
        return [
            'student_id'    => ['sometimes', 'exists:students,id'],
            'instructor_id' => ['sometimes', 'exists:instructors,id'],
            'vehicle_id'    => ['nullable', 'exists:vehicles,id'],
            'type'          => ['sometimes', 'in:conduite,code,accompagnement,bilan,examen_blanc'],
            'starts_at'     => ['sometimes', 'date'],
            'ends_at'       => ['sometimes', 'date', 'after:starts_at'],
            'notes'         => ['nullable', 'string'],
        ];
    }
}
