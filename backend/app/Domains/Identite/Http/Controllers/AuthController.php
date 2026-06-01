<?php

namespace App\Domains\Identite\Http\Controllers;

use App\Domains\Identite\Http\Requests\LoginRequest;
use App\Domains\Identite\Http\Resources\UserResource;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        if (! Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'code'    => 'INVALID_CREDENTIALS',
                'message' => 'Identifiants incorrects.',
            ], 401);
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (! $user->is_active) {
            Auth::logout();

            return response()->json([
                'code'    => 'ACCOUNT_DISABLED',
                'message' => 'Ce compte est desactive.',
            ], 403);
        }

        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        return response()->json([
            'data' => new UserResource($user),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();
        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->json(['message' => 'Deconnexion reussie.']);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'data' => new UserResource($request->user()),
        ]);
    }
}
