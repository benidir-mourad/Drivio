<?php

namespace App\Domains\Eleves\Http\Controllers;

use App\Domains\Eleves\Http\Requests\StoreStudentRequest;
use App\Domains\Eleves\Http\Requests\UpdateStudentRequest;
use App\Domains\Eleves\Http\Requests\UploadStudentDocumentRequest;
use App\Domains\Eleves\Http\Resources\StudentDocumentResource;
use App\Domains\Eleves\Http\Resources\StudentResource;
use App\Domains\Eleves\Models\Student;
use App\Domains\Eleves\Models\StudentDocument;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;

class StudentController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Student::class);

        $query = Student::query();

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

        if ($category = $request->query('license_category')) {
            $query->where('license_category', $category);
        }

        $students = $query->orderBy('last_name')->orderBy('first_name')
            ->paginate((int) $request->query('per_page', '15'));

        return StudentResource::collection($students);
    }

    public function show(Student $student): StudentResource
    {
        $this->authorize('view', $student);

        return new StudentResource($student->load('documents'));
    }

    public function store(StoreStudentRequest $request): JsonResponse
    {
        $student = Student::create($request->validated());

        return response()->json(['data' => new StudentResource($student)], 201);
    }

    public function update(UpdateStudentRequest $request, Student $student): StudentResource
    {
        $student->update($request->validated());

        return new StudentResource($student->fresh()->load('documents'));
    }

    public function destroy(Student $student): JsonResponse
    {
        $this->authorize('delete', $student);

        $student->delete();

        return response()->json(null, 204);
    }

    public function uploadDocument(UploadStudentDocumentRequest $request, Student $student): JsonResponse
    {
        $file = $request->file('file');
        $path = $file->store("students/{$student->id}/documents", 'private');

        $document = StudentDocument::create([
            'student_id' => $student->id,
            'type'       => $request->input('type'),
            'file_name'  => $file->getClientOriginalName(),
            'file_path'  => $path,
            'mime_type'  => $file->getMimeType(),
            'size'       => $file->getSize(),
        ]);

        return response()->json(['data' => new StudentDocumentResource($document)], 201);
    }

    public function destroyDocument(Student $student, StudentDocument $document): JsonResponse
    {
        $this->authorize('uploadDocument', $student);

        Storage::disk('private')->delete($document->file_path);
        $document->delete();

        return response()->json(null, 204);
    }
}
