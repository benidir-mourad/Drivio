<?php

namespace App\Domains\Vehicules\Http\Requests;

use App\Domains\Vehicules\Models\Vehicle;
use Illuminate\Foundation\Http\FormRequest;

class UpdateVehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Vehicle $vehicle */
        $vehicle = $this->route('vehicle');

        return $this->user()->can('update', $vehicle);
    }

    public function rules(): array
    {
        $vehicleId = $this->route('vehicle')?->id;

        return [
            'plate_number'     => ['sometimes', 'string', 'max:20', "unique:vehicles,plate_number,{$vehicleId}"],
            'brand'            => ['sometimes', 'string', 'max:100'],
            'model'            => ['sometimes', 'string', 'max:100'],
            'year'             => ['sometimes', 'integer', 'min:1990', 'max:'.(date('Y') + 1)],
            'license_category' => ['sometimes', 'in:A,A1,A2,AM,B,B1,C,D'],
            'fuel_type'        => ['sometimes', 'in:essence,diesel,electrique,hybride'],
            'status'           => ['sometimes', 'in:available,maintenance,retired'],
            'mileage'          => ['nullable', 'integer', 'min:0'],
            'notes'            => ['nullable', 'string'],
        ];
    }
}
