<?php

namespace App\Domains\Planning\Http\Requests;

use App\Domains\Planning\Models\Lesson;
use Illuminate\Foundation\Http\FormRequest;

class CancelLessonRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Lesson $lesson */
        $lesson = $this->route('lesson');

        return $this->user()->can('cancel', $lesson);
    }

    public function rules(): array
    {
        return [
            'cancellation_reason' => ['nullable', 'string', 'max:500'],
        ];
    }
}
