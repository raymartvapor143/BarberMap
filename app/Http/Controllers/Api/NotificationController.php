<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function getNotifications(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'notifications' => $user->notifications()->limit(20)->get(),
            'unread_count' => $user->notifications()->where('is_read', false)->count(),
        ]);
    }

    public function markAsRead(Request $request, ?int $id = null)
    {
        $user = $request->user();
        if ($id) {
            $user->notifications()->where('id', $id)->update(['is_read' => true]);
        } else {
            $user->notifications()->update(['is_read' => true]);
        }

        return response()->json(['message' => 'Notifications marked as read.']);
    }
}
