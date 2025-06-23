<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\WaChat;
use App\Models\WaChatCategory;
use App\Models\WaChatSummary;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class WaChatController extends Controller
{
    function index(){
        $summaries = WaChat::select('user_id', DB::raw('MAX(id) as last_chat_id'))
        ->groupBy('user_id')
        ->with('user') // relasi ke model User
        ->orderBy('id','desc')
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
    public function summary(Request $request)
    {
        // Get the date from request or use today
        $date = $request->input('date', Carbon::today()->format('Y-m-d'));
        $selectedDate = Carbon::parse($date);
        
        // Get summaries for the selected date with user and category
        $summaries = WaChatSummary::with(['user', 'category'])
            ->where('date', $date)
            ->get()
            ->map(function ($summary) {
                return [
                    'id' => $summary->id,
                    'user_id' => $summary->user_id,
                    'user_name' => $summary->user->name,
                    'user_phone' => $summary->user->phone,
                    'summary' => $summary->summary,
                    'category_id' => $summary->category_id,
                    'category_name' => $summary->category->name,
                    'category_color' => $this->getCategoryColor($summary->category->id),
                    'chat_count' => $summary->chat_count,
                    'created_at' => $summary->created_at->format('Y-m-d H:i:s'),
                ];
            });
        
        // Get summary statistics
        $stats = [
            'total_users' => $summaries->count(),
            'total_messages' => $summaries->sum('chat_count'),
            'categories' => WaChatSummary::where('date', $date)
                ->join('wa_chat_categories', 'wa_chat_summaries.category_id', '=', 'wa_chat_categories.id')
                ->select('wa_chat_categories.name', DB::raw('count(*) as count'))
                ->groupBy('wa_chat_categories.name')
                ->orderBy('count', 'desc')
                ->get(),
        ];
        
        // Get date range for navigation (7 days before and after selected date)
        $startDate = Carbon::parse($date)->subDays(7);
        $endDate = Carbon::parse($date)->addDays(7);
        
        $dateRange = [];
        $currentDate = $startDate->copy();
        
        while ($currentDate->lte($endDate)) {
            $formattedDate = $currentDate->format('Y-m-d');
            $dateRange[] = [
                'date' => $formattedDate,
                'display' => $currentDate->format('d M'),
                'is_today' => $currentDate->isToday(),
                'has_data' => WaChatSummary::where('date', $formattedDate)->exists(),
            ];
            $currentDate->addDay();
        }
        
        // Return the view with data
        return Inertia::render('DailyChatSummary', [
            'summaries' => $summaries,
            'stats' => $stats,
            'selectedDate' => $selectedDate->format('Y-m-d'),
            'selectedDateFormatted' => $selectedDate->format('l, d F Y'),
            'dateRange' => $dateRange,
            'categories' => WaChatCategory::select('id', 'name', 'description')->get(),
        ]);
    }
    
    /**
     * View chat details for a specific user on a specific date
     */
    public function viewChats(Request $request, $userId)
    {
        $date = $request->input('date', Carbon::today()->format('Y-m-d'));
        $selectedDate = Carbon::parse($date);
        
        $user = User::findOrFail($userId);
        
        // Get chats for the specified user on the selected date
        $chats = WaChat::where('user_id', $userId)
            ->whereBetween('created_at', [
                $selectedDate->startOfDay()->format('Y-m-d H:i:s'),
                $selectedDate->endOfDay()->format('Y-m-d H:i:s')
            ])
            ->orderBy('created_at')
            ->get()
            ->map(function ($chat) {
                return [
                    'id' => $chat->id,
                    'message' => $chat->message,
                    'is_from_me' => $chat->is_from_me,
                    'created_at' => Carbon::parse($chat->created_at)->format('H:i'),
                ];
            });
        
        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'phone' => $user->phone,
            ],
            'chats' => $chats,
            'date' => $selectedDate->format('Y-m-d'),
            'dateFormatted' => $selectedDate->format('l, d F Y'),
        ]);
    }
    
    /**
     * Generate a color for a category based on its ID
     */
    private function getCategoryColor($categoryId)
    {
        // Array of flat design colors
        $colors = [
            '#3498db', '#2ecc71', '#9b59b6', '#e74c3c', '#f39c12', 
            '#1abc9c', '#d35400', '#c0392b', '#16a085', '#8e44ad',
            '#27ae60', '#2980b9', '#f1c40f', '#e67e22', '#7f8c8d'
        ];
        
        // Use category ID to pick a consistent color
        return $colors[$categoryId % count($colors)];
    }
}
