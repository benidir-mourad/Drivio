<?php

namespace App\Domains\Eleves\Http\Requests;

use App\Domains\Eleves\Models\Student;
use Illuminate\Foundation\Http\FormRequest;

class UpdateStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Student $student */
        $student = $this->route('student');

        return $this->user()->can('update', $student);
    }

    public function rules(): array
    {
        $studentId = $this->route('student')?->id;

        return [
            'first_name'       => ['sometimes', 'string', 'max:100'],
            'last_name'        => ['sometimes', 'string', 'max:100'],
            'email'            => ['sometimes', 'email', 'max:255', "unique:students,email,{$studentId}"],
            'phone'            => ['nullable', 'string', 'max:20'],
            'address'          => ['nullable', 'string', 'max:500'],
            'date_of_birth'    => ['nullable', 'date', 'before:-16 years'],
            'license_category' => ['sometimes', 'in:A,A1,A2,AM,B,B1,BE,C,CE,D'],
            'enrollment_date'  => ['sometimes', 'date'],
            'status'           => ['sometimes', 'in:active,suspended,graduated'],
            'filiere'          => ['sometimes', 'in:classique,cap'],
            'hours_objective'  => ['sometimes', 'integer', 'min:1', 'max:100'],
            'dossier_number'   => ['nullable', 'string', 'max:50'],
            'notes'            => ['nullable', 'string'],
            'user_id'          => ['nullable', 'exists:users,id'],
        ];
    }
}
