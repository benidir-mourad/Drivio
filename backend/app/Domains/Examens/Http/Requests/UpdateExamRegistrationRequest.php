<?php

namespace App\Domains\Examens\Http\Requests;

use App\Domains\Examens\Models\ExamRegistration;
use Illuminate\Foundation\Http\FormRequest;

class UpdateExamRegistrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var ExamRegistration $exam */
        $exam = $this->route('exam_registration');

        return $this->user()->can('update', $exam);
    }

    public function rules(): array
    {
        return [
            'type'           => ['sometimes', 'in:theorique,pratique,reexamen_theorique,reexamen_pratique'],
            'center'         => ['nullable', 'in:goca,autosecure,car,other'],
            'center_city'    => ['nullable', 'string', 'max:100'],
            'scheduled_date' => ['nullable', 'date'],
            'registered_at'  => ['nullable', 'date'],
            'notes'          => ['nullable', 'string'],
        ];
    }
}
