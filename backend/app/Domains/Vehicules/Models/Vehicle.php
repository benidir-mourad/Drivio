<?php

namespace App\Domains\Vehicules\Models;

use Database\Factories\VehicleFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vehicle extends Model
{
    /** @use HasFactory<VehicleFactory> */
    use HasFactory;

    use SoftDeletes;

    protected static function newFactory(): VehicleFactory
    {
        return VehicleFactory::new();
    }

    protected $fillable = [
        'plate_number',
        'brand',
        'model',
        'year',
        'license_category',
        'fuel_type',
        'status',
        'mileage',
        'notes',
    ];

    protected $casts = [
        'year'    => 'integer',
        'mileage' => 'integer',
    ];
}
