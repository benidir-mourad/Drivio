<?php

namespace App\Domains\Eleves\Http\Resources;

use App\Domains\Eleves\Models\StudentDocument;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin StudentDocument */
class StudentDocumentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'student_id' => $this->student_id,
            'type'       => $this->type,
            'file_name'  => $this->file_name,
            'mime_type'  => $this->mime_type,
            'size'       => $this->size,
            'created_at' => $this->created_at?->toDateTimeString(),
        ];
    }
}
