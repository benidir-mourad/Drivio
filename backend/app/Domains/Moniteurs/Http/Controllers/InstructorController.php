<?php

namespace App\Domains\Moniteurs\Http\Controllers;

use App\Domains\Moniteurs\Http\Requests\StoreInstructorRequest;
use App\Domains\Moniteurs\Http\Requests\UpdateInstructorRequest;
use App\Domains\Moniteurs\Http\Resources\InstructorResource;
use App\Domains\Moniteurs\Models\Instructor;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class InstructorController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Instructor::class);

        $query = Instructor::query();

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search): void {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $instructors = $query->orderBy('last_name')->orderBy('first_name')
            ->paginate((int) $request->query('per_page', '15'));

        return InstructorResource::collection($instructors);
    }

    public function show(Instructor $instructor): InstructorResource
    {
        $this->authorize('view', $instructor);

        return new InstructorResource($instructor);
    }

    public function store(StoreInstructorRequest $request): JsonResponse
    {
        $instructor = Instructor::create($request->validated());

        return response()->json(['data' => new InstructorResource($instructor)], 201);
    }

    public function update(UpdateInstructorRequest $request, Instructor $instructor): InstructorResource
    {
        $instructor->update($request->validated());

        return new InstructorResource($instructor->fresh());
    }

    public function destroy(Instructor $instructor): JsonResponse
    {
        $this->authorize('delete', $instructor);

        $instructor->delete();

        return response()->json(null, 204);
    }
}
