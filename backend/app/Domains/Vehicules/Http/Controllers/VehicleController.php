<?php

namespace App\Domains\Vehicules\Http\Controllers;

use App\Domains\Vehicules\Http\Requests\StoreVehicleRequest;
use App\Domains\Vehicules\Http\Requests\UpdateVehicleRequest;
use App\Domains\Vehicules\Http\Resources\VehicleResource;
use App\Domains\Vehicules\Models\Vehicle;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class VehicleController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Vehicle::class);

        $query = Vehicle::query();

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search): void {
                $q->where('plate_number', 'like', "%{$search}%")
                    ->orWhere('brand', 'like', "%{$search}%")
                    ->orWhere('model', 'like', "%{$search}%");
            });
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($category = $request->query('license_category')) {
            $query->where('license_category', $category);
        }

        $vehicles = $query->orderBy('brand')->orderBy('model')
            ->paginate((int) $request->query('per_page', '15'));

        return VehicleResource::collection($vehicles);
    }

    public function show(Vehicle $vehicle): VehicleResource
    {
        $this->authorize('view', $vehicle);

        return new VehicleResource($vehicle);
    }

    public function store(StoreVehicleRequest $request): JsonResponse
    {
        $vehicle = Vehicle::create($request->validated());

        return response()->json(['data' => new VehicleResource($vehicle)], 201);
    }

    public function update(UpdateVehicleRequest $request, Vehicle $vehicle): VehicleResource
    {
        $vehicle->update($request->validated());

        return new VehicleResource($vehicle->fresh());
    }

    public function destroy(Vehicle $vehicle): JsonResponse
    {
        $this->authorize('delete', $vehicle);

        $vehicle->delete();

        return response()->json(null, 204);
    }
}
