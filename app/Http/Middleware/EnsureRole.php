<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if ($user->status === 'disabled' || $user->status === 'suspended') {
            return response()->json(['message' => 'Your account has been suspended or disabled.'], 403);
        }

        // Super admin bypasses all role requirements
        if ($user->role === 'super_admin') {
            return $next($request);
        }

        // If 'admin' is in allowed roles, allow sub-admin roles too
        if (in_array('admin', $roles) && in_array($user->role, ['super_admin', 'admin', 'moderator', 'payment_admin'])) {
            return $next($request);
        }

        if (!in_array($user->role, $roles)) {
            return response()->json(['message' => 'Unauthorized. Insufficient permissions.'], 403);
        }

        return $next($request);
    }
}
