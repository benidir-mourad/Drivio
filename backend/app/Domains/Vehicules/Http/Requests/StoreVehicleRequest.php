<?php

namespace App\Domains\Vehicules\Http\Requests;

use App\Domains\Vehicules\Models\Vehicle;
use Illuminate\Foundation\Http\FormRequest;

class StoreVehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('create', Vehicle::class);
    }

    public function rules(): array
    {
        return [
            'plate_number'     => ['required', 'string', 'max:20', 'unique:vehicles,plate_number'],
            'brand'            => ['required', 'string', 'max:100'],
            'model'            => ['required', 'string', 'max:100'],
            'year'             => ['required', 'integer', 'min:1990', 'max:'.(date('Y') + 1)],
            'license_category' => ['required', 'in:A,A1,A2,AM,B,B1,C,D'],
            'fuel_type'        => ['required', 'in:essence,diesel,electrique,hybride'],
            'status'           => ['sometimes', 'in:available,maintenance,retired'],
            'mileage'          => ['nullable', 'integer', 'min:0'],
            'notes'            => ['nullable', 'string'],
        ];
    }
}
