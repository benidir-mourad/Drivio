<?php

namespace App\Domains\Eleves\Http\Resources;

use App\Domains\Eleves\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Student */
class StudentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'first_name'       => $this->first_name,
            'last_name'        => $this->last_name,
            'full_name'        => $this->full_name,
            'email'            => $this->email,
            'phone'            => $this->phone,
            'address'          => $this->address,
            'date_of_birth'    => $this->date_of_birth?->toDateString(),
            'license_category' => $this->license_category,
            'enrollment_date'  => $this->enrollment_date->toDateString(),
            'status'           => $this->status,
            'filiere'          => $this->filiere,
            'hours_objective'  => $this->hours_objective,
            'dossier_number'   => $this->dossier_number,
            'notes'            => $this->notes,
            'user_id'          => $this->user_id,
            'documents'        => StudentDocumentResource::collection($this->whenLoaded('documents')),
            // Pedagogie stats — included when lessons are loaded
            'hours_completed' => $this->when(
                $this->relationLoaded('lessons'),
                fn () => $this->hours_completed,
            ),
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
