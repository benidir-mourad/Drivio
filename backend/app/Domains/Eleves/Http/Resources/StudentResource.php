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
            'notes'            => $this->notes,
            'user_id'          => $this->user_id,
            'documents'        => StudentDocumentResource::collection($this->whenLoaded('documents')),
            'created_at'       => $this->created_at?->toDateTimeString(),
            'updated_at'       => $this->updated_at?->toDateTimeString(),
        ];
    }
}
