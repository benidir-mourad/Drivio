<?php

namespace App\Domains\Examens\Http\Requests;

use App\Domains\Examens\Models\ExamRegistration;
use Illuminate\Foundation\Http\FormRequest;

class RecordResultRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var ExamRegistration $exam */
        $exam = $this->route('exam_registration');

        return $this->user()->can('recordResult', $exam);
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'in:passed,failed,absent,cancelled'],
            // Score only relevant for theory exams (0–50)
            'score' => ['nullable', 'numeric', 'min:0', 'max:50'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
