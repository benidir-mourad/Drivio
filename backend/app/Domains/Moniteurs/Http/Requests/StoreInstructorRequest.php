<?php

namespace App\Domains\Moniteurs\Http\Requests;

use App\Domains\Moniteurs\Models\Instructor;
use Illuminate\Foundation\Http\FormRequest;

class StoreInstructorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Instructor::class);
    }

    public function rules(): array
    {
        return [
            'first_name'     => ['required', 'string', 'max:100'],
            'last_name'      => ['required', 'string', 'max:100'],
            'email'          => ['required', 'email', 'max:255', 'unique:instructors,email'],
            'phone'          => ['nullable', 'string', 'max:20'],
            'license_number' => ['nullable', 'string', 'max:50'],
            'hire_date'      => ['nullable', 'date'],
            'status'         => ['sometimes', 'in:active,inactive'],
            'notes'          => ['nullable', 'string'],
            'user_id'        => ['nullable', 'exists:users,id'],
        ];
    }
}
