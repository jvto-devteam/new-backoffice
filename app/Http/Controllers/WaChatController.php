<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\WaChat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class WaChatController extends Controller
{
    function index(){
        $summaries = WaChat::select('user_id', DB::raw('MAX(id) as last_chat_id'))
        ->groupBy('user_id')
        ->with('user') // relasi ke model User
        ->get()
        ->map(function ($chat) {
            $lastChat = WaChat::where('user_id', $chat->user_id)
                ->orderBy('id', 'desc')
                ->first();

            return [
                'user_id'   => $chat->user_id,
                'avatar'    => "https://static-00.iconduck.com/assets.00/avatar-default-icon-2048x2048-h6w375ur.png",
                'name'      => $lastChat->user->name ?? '(No Name)',
                'phone'     => $lastChat->user->phone ?? '-',
                'last_chat' => $lastChat->message,
                'sent_at'   => $lastChat->created_at,
            ];
        });
        return Inertia::render('WaChat/Index', ['summaries' => $summaries]);
    }
    public function getChatDetail($userId)
    {
        try {
            $getUser = User::findOrFail($userId);

            $chats = WaChat::where('user_id', $userId)
                ->orderBy('created_at', 'asc')
                ->get(['id', 'message', 'is_from_me', 'created_at', 'has_media', 'media_mime']);
            
            $user = [
                'id'    => $getUser->id,
                'name'  => $getUser->name,
                'phone' => $getUser->phone,
            ];

            return response()->json([
                'user' => $user,
                'chats' => $chats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error fetching chat details',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
