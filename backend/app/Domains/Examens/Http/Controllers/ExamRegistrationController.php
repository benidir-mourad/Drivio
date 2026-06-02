<?php

namespace App\Domains\Examens\Http\Controllers;

use App\Domains\Examens\Http\Requests\RecordResultRequest;
use App\Domains\Examens\Http\Requests\StoreExamRegistrationRequest;
use App\Domains\Examens\Http\Requests\UpdateExamRegistrationRequest;
use App\Domains\Examens\Http\Resources\ExamRegistrationResource;
use App\Domains\Examens\Models\ExamRegistration;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ExamRegistrationController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', ExamRegistration::class);

        $user  = $request->user();
        $query = ExamRegistration::with('student');

        // Elèves can only see their own exams
        if ($user->hasRole('eleve')) {
            $query->whereHas('student', fn ($q) => $q->where('user_id', $user->id));
        }

        if ($studentId = $request->query('student_id')) {
            $query->where('student_id', $studentId);
        }

        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($dateFrom = $request->query('date_from')) {
            $query->where('scheduled_date', '>=', $dateFrom);
        }

        if ($dateTo = $request->query('date_to')) {
            $query->where('scheduled_date', '<=', $dateTo);
        }

        $exams = $query->orderBy('scheduled_date', 'desc')
            ->paginate((int) $request->query('per_page', '20'));

        return ExamRegistrationResource::collection($exams);
    }

    public function show(ExamRegistration $examRegistration): ExamRegistrationResource
    {
        $this->authorize('view', $examRegistration);

        return new ExamRegistrationResource($examRegistration->load('student'));
    }

    public function store(StoreExamRegistrationRequest $request): JsonResponse
    {
        $exam = ExamRegistration::create($request->validated());

        return response()->json(
            ['data' => new ExamRegistrationResource($exam->load('student'))],
            201,
        );
    }

    public function update(UpdateExamRegistrationRequest $request, ExamRegistration $examRegistration): ExamRegistrationResource
    {
        $examRegistration->update($request->validated());

        return new ExamRegistrationResource($examRegistration->fresh()->load('student'));
    }

    public function recordResult(RecordResultRequest $request, ExamRegistration $examRegistration): ExamRegistrationResource
    {
        $examRegistration->update([
            'status' => $request->validated('status'),
            'score'  => $request->validated('score'),
            'notes'  => $request->validated('notes') ?? $examRegistration->notes,
        ]);

        return new ExamRegistrationResource($examRegistration->fresh()->load('student'));
    }

    public function destroy(ExamRegistration $examRegistration): JsonResponse
    {
        $this->authorize('delete', $examRegistration);

        $examRegistration->delete();

        return response()->json(null, 204);
    }

    /**
     * Statistics summary: pass rates by type for a given period.
     */
    public function stats(Request $request): JsonResponse
    {
        $this->authorize('viewAny', ExamRegistration::class);

        $query = ExamRegistration::query()
            ->whereNotIn('status', ['planned', 'cancelled']);

        if ($year = $request->query('year')) {
            $query->whereYear('scheduled_date', $year);
        }

        $results = $query->get();

        $stats = [];

        foreach (['theorique', 'pratique', 'reexamen_theorique', 'reexamen_pratique'] as $type) {
            $subset = $results->where('type', $type);
            $total  = $subset->count();
            $passed = $subset->where('status', 'passed')->count();

            $stats[$type] = [
                'total'     => $total,
                'passed'    => $passed,
                'failed'    => $subset->where('status', 'failed')->count(),
                'absent'    => $subset->where('status', 'absent')->count(),
                'rate'      => $total                         > 0 ? (float) round($passed / $total * 100, 1) : null,
                'avg_score' => $type !== 'pratique' && $total > 0
                    ? round($subset->whereNotNull('score')->avg('score'), 1)
                    : null,
            ];
        }

        return response()->json(['data' => $stats]);
    }
}
