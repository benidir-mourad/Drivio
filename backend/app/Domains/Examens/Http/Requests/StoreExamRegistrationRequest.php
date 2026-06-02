<?php

namespace App\Domains\Examens\Http\Requests;

use App\Domains\Examens\Models\ExamRegistration;
use Illuminate\Foundation\Http\FormRequest;

class StoreExamRegistrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', ExamRegistration::class);
    }

    public function rules(): array
    {
        return [
            'student_id'     => ['required', 'exists:students,id'],
            'type'           => ['required', 'in:theorique,pratique,reexamen_theorique,reexamen_pratique'],
            'center'         => ['nullable', 'in:goca,autosecure,car,other'],
            'center_city'    => ['nullable', 'string', 'max:100'],
            'scheduled_date' => ['nullable', 'date'],
            'registered_at'  => ['nullable', 'date'],
            'notes'          => ['nullable', 'string'],
        ];
    }
}
