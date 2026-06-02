<?php

namespace App\Domains\Vehicules\Http\Resources;

use App\Domains\Vehicules\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Vehicle */
class VehicleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'plate_number'     => $this->plate_number,
            'brand'            => $this->brand,
            'model'            => $this->model,
            'year'             => $this->year,
            'license_category' => $this->license_category,
            'fuel_type'        => $this->fuel_type,
            'status'           => $this->status,
            'mileage'          => $this->mileage,
            'notes'            => $this->notes,
            'created_at'       => $this->created_at?->toDateTimeString(),
            'updated_at'       => $this->updated_at?->toDateTimeString(),
        ];
    }
}
