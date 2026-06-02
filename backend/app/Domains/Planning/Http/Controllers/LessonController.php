<?php

namespace App\Domains\Planning\Http\Controllers;

use App\Domains\Planning\Http\Requests\CancelLessonRequest;
use App\Domains\Planning\Http\Requests\StoreLessonRequest;
use App\Domains\Planning\Http\Requests\UpdateLessonRequest;
use App\Domains\Planning\Http\Resources\LessonResource;
use App\Domains\Planning\Models\Lesson;
use App\Domains\Planning\Services\ConflictChecker;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class LessonController extends Controller
{
    public function __construct(private readonly ConflictChecker $conflictChecker) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Lesson::class);

        $user  = $request->user();
        $query = Lesson::with(['student', 'instructor', 'vehicle']);

        // Filter by role
        if ($user->hasRole('moniteur')) {
            $query->whereHas('instructor', fn ($q) => $q->where('user_id', $user->id));
        } elseif ($user->hasRole('eleve')) {
            $query->whereHas('student', fn ($q) => $q->where('user_id', $user->id));
        }

        if ($dateFrom = $request->query('date_from')) {
            $query->where('starts_at', '>=', Carbon::parse($dateFrom)->startOfDay());
        }

        if ($dateTo = $request->query('date_to')) {
            $query->where('starts_at', '<=', Carbon::parse($dateTo)->endOfDay());
        }

        if ($instructorId = $request->query('instructor_id')) {
            $query->where('instructor_id', $instructorId);
        }

        if ($studentId = $request->query('student_id')) {
            $query->where('student_id', $studentId);
        }

        if ($vehicleId = $request->query('vehicle_id')) {
            $query->where('vehicle_id', $vehicleId);
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        $lessons = $query->orderBy('starts_at')
            ->paginate((int) $request->query('per_page', '20'));

        return LessonResource::collection($lessons);
    }

    public function calendar(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Lesson::class);

        $user     = $request->user();
        $dateFrom = Carbon::parse($request->query('date_from', now()->startOfWeek()->toDateString()));
        $dateTo   = Carbon::parse($request->query('date_to', now()->endOfWeek()->toDateString()));

        $query = Lesson::with(['student', 'instructor', 'vehicle'])
            ->where('starts_at', '>=', $dateFrom->startOfDay())
            ->where('starts_at', '<=', $dateTo->endOfDay())
            ->orderBy('starts_at');

        if ($user->hasRole('moniteur')) {
            $query->whereHas('instructor', fn ($q) => $q->where('user_id', $user->id));
        } elseif ($user->hasRole('eleve')) {
            $query->whereHas('student', fn ($q) => $q->where('user_id', $user->id));
        }

        if ($instructorId = $request->query('instructor_id')) {
            $query->where('instructor_id', $instructorId);
        }

        if ($studentId = $request->query('student_id')) {
            $query->where('student_id', $studentId);
        }

        // Group lessons by date key (YYYY-MM-DD)
        $grouped = $query->get()->groupBy(fn (Lesson $lesson) => $lesson->starts_at->toDateString());

        $data    = [];
        $current = $dateFrom->copy();

        while ($current->lte($dateTo)) {
            $key        = $current->toDateString();
            $data[$key] = LessonResource::collection($grouped->get($key, collect()))->resolve();
            $current->addDay();
        }

        return response()->json(['data' => $data]);
    }

    public function show(Lesson $lesson): LessonResource
    {
        $this->authorize('view', $lesson);

        return new LessonResource($lesson->load(['student', 'instructor', 'vehicle']));
    }

    public function store(StoreLessonRequest $request): JsonResponse
    {
        $data = $request->validated();

        $conflicts = $this->conflictChecker->check(
            instructorId: $data['instructor_id'],
            studentId: $data['student_id'],
            vehicleId: $data['vehicle_id'] ?? null,
            startsAt: Carbon::parse($data['starts_at']),
            endsAt: Carbon::parse($data['ends_at']),
        );

        if (! empty($conflicts)) {
            return response()->json([
                'code'      => 'CONFLICT',
                'message'   => 'Un conflit de planning a été détecté.',
                'conflicts' => $conflicts,
            ], 422);
        }

        $lesson = Lesson::create($data);

        return response()->json(
            ['data' => new LessonResource($lesson->load(['student', 'instructor', 'vehicle']))],
            201,
        );
    }

    public function update(UpdateLessonRequest $request, Lesson $lesson): LessonResource
    {
        $data = $request->validated();

        $conflicts = $this->conflictChecker->check(
            instructorId: $data['instructor_id'] ?? $lesson->instructor_id,
            studentId: $data['student_id']       ?? $lesson->student_id,
            vehicleId: $data['vehicle_id']       ?? $lesson->vehicle_id,
            startsAt: Carbon::parse($data['starts_at'] ?? $lesson->starts_at),
            endsAt: Carbon::parse($data['ends_at'] ?? $lesson->ends_at),
            excludeLessonId: $lesson->id,
        );

        if (! empty($conflicts)) {
            abort(response()->json([
                'code'      => 'CONFLICT',
                'message'   => 'Un conflit de planning a été détecté.',
                'conflicts' => $conflicts,
            ], 422));
        }

        $lesson->update($data);

        return new LessonResource($lesson->fresh()->load(['student', 'instructor', 'vehicle']));
    }

    public function destroy(Lesson $lesson): JsonResponse
    {
        $this->authorize('delete', $lesson);

        $lesson->delete();

        return response()->json(null, 204);
    }

    public function cancel(CancelLessonRequest $request, Lesson $lesson): LessonResource
    {
        $lesson->update([
            'status'              => 'cancelled',
            'cancellation_reason' => $request->validated('cancellation_reason'),
        ]);

        return new LessonResource($lesson->fresh()->load(['student', 'instructor', 'vehicle']));
    }

    public function complete(Request $request, Lesson $lesson): LessonResource
    {
        $this->authorize('complete', $lesson);

        $lesson->update(['status' => 'completed']);

        return new LessonResource($lesson->fresh()->load(['student', 'instructor', 'vehicle']));
    }

    public function markNoShow(Request $request, Lesson $lesson): LessonResource
    {
        $this->authorize('markNoShow', $lesson);

        $lesson->update(['status' => 'no_show']);

        return new LessonResource($lesson->fresh()->load(['student', 'instructor', 'vehicle']));
    }
}
