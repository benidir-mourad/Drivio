<?php

namespace App\Domains\Planning\Http\Resources;

use App\Domains\Planning\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Lesson */
class LessonResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->id,
            'type'                => $this->type,
            'starts_at'           => $this->starts_at->format('Y-m-d H:i:s'),
            'ends_at'             => $this->ends_at->format('Y-m-d H:i:s'),
            'duration_minutes'    => $this->duration_minutes,
            'status'              => $this->status,
            'cancellation_reason' => $this->cancellation_reason,
            'notes'               => $this->notes,
            'student'             => $this->whenLoaded('student', fn () => [
                'id'        => $this->student->id,
                'full_name' => $this->student->full_name,
                'email'     => $this->student->email,
            ]),
            'instructor' => $this->whenLoaded('instructor', fn () => [
                'id'        => $this->instructor->id,
                'full_name' => $this->instructor->full_name,
                'email'     => $this->instructor->email,
            ]),
            'vehicle' => $this->whenLoaded('vehicle', fn () => $this->vehicle ? [
                'id'           => $this->vehicle->id,
                'plate_number' => $this->vehicle->plate_number,
                'brand'        => $this->vehicle->brand,
                'model'        => $this->vehicle->model,
            ] : null),
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
