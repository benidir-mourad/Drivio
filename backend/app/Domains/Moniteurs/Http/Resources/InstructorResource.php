<?php

namespace App\Domains\Moniteurs\Http\Resources;

use App\Domains\Moniteurs\Models\Instructor;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Instructor */
class InstructorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'first_name'     => $this->first_name,
            'last_name'      => $this->last_name,
            'full_name'      => $this->full_name,
            'email'          => $this->email,
            'phone'          => $this->phone,
            'license_number' => $this->license_number,
            'hire_date'      => $this->hire_date?->toDateString(),
            'status'         => $this->status,
            'notes'          => $this->notes,
            'user_id'        => $this->user_id,
            'created_at'     => $this->created_at?->toDateTimeString(),
            'updated_at'     => $this->updated_at?->toDateTimeString(),
        ];
    }
}
