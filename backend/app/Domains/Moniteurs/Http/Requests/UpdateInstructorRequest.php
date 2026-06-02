<?php

namespace App\Domains\Moniteurs\Http\Requests;

use App\Domains\Moniteurs\Models\Instructor;
use Illuminate\Foundation\Http\FormRequest;

class UpdateInstructorRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Instructor $instructor */
        $instructor = $this->route('instructor');

        return $this->user()->can('update', $instructor);
    }

    public function rules(): array
    {
        $instructorId = $this->route('instructor')?->id;

        return [
            'first_name'     => ['sometimes', 'string', 'max:100'],
            'last_name'      => ['sometimes', 'string', 'max:100'],
            'email'          => ['sometimes', 'email', 'max:255', "unique:instructors,email,{$instructorId}"],
            'phone'          => ['nullable', 'string', 'max:20'],
            'license_number' => ['nullable', 'string', 'max:50'],
            'hire_date'      => ['nullable', 'date'],
            'status'         => ['sometimes', 'in:active,inactive'],
            'notes'          => ['nullable', 'string'],
            'user_id'        => ['nullable', 'exists:users,id'],
        ];
    }
}
