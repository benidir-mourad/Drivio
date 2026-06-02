<?php

namespace App\Domains\Eleves\Http\Requests;

use App\Domains\Eleves\Models\Student;
use Illuminate\Foundation\Http\FormRequest;

class UploadStudentDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Student $student */
        $student = $this->route('student');

        return $this->user()->can('uploadDocument', $student);
    }

    public function rules(): array
    {
        return [
            'type' => ['required', 'in:identity_card,photo,medical_cert,driving_history,other'],
            'file' => ['required', 'file', 'max:10240', 'mimes:jpg,jpeg,png,pdf'],
        ];
    }
}
