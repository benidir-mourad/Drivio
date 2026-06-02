<?php

namespace App\Domains\Examens\Http\Resources;

use App\Domains\Examens\Models\ExamRegistration;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin ExamRegistration */
class ExamRegistrationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'type'           => $this->type,
            'center'         => $this->center,
            'center_city'    => $this->center_city,
            'scheduled_date' => $this->scheduled_date?->toDateString(),
            'registered_at'  => $this->registered_at?->toDateString(),
            'status'         => $this->status,
            'score'          => $this->score,
            'is_theory'      => $this->isTheory(),
            'notes'          => $this->notes,
            'student'        => $this->whenLoaded('student', fn () => [
                'id'        => $this->student->id,
                'full_name' => $this->student->full_name,
                'email'     => $this->student->email,
                'filiere'   => $this->student->filiere,
            ]),
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
