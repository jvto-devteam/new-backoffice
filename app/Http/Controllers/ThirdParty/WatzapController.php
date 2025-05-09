<?php

namespace App\Http\Controllers\ThirdParty;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\WaChat;
use App\Models\WaChatCategory;
use App\Models\WaChatIgnore;
use App\Models\WaChatSummary;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WatzapController extends Controller
{
    public function webhook(Request $request)
    {
        $requestData = file_get_contents("php://input");
        file_put_contents(public_path("watzap.txt"), $requestData);
        $payload = json_decode($requestData, true);
    
        if (
            $payload['type'] !== 'incoming_chat' ||
            ($payload['data']['name'] ?? '') === 'status' ||
            !str_contains($payload['data']['chat_id'] ?? '', '@s.whatsapp.net')
        ) {
            return response()->json(['status' => 'ignored']);
        }
    
        $data = $payload['data'];
    
        // Ambil nomor tanpa suffix
        $phone = preg_replace('/@s\.whatsapp\.net$/', '', $data['chat_id']);
    
        // Cek apakah nomor di-ignore
        if (WaChatIgnore::where('phone', $phone)->exists()) {
            return response()->json(['status' => 'ignored:blocked_number']);
        }
    
        // Temukan atau buat user
        $user = User::firstOrCreate(
            ['phone' => $phone],
            ['name' => $data['name']]
        );
    
        // Simpan chat
        WaChat::create([
            'user_id'     => $user->id,
            'message'     => $data['message_body'],
            'is_from_me'  => $data['is_from_me'] ? '1' : '0',
            'has_media'   => $data['has_media'] ? '1' : '0',
            'media_mime'  => $data['media_mime'] ?: null,
        ]);
    
        return response()->json(['status' => 'stored']);
    }
/**
 * Generate daily chat summaries for each user with categories
 * 
 * @return array Summary results with user information, summary, and category status
 */
    public function generateDailySummaries()
    {
        // Get today's date range (start of day to now)
        $today = Carbon::today();
        $now = Carbon::now();
        
        // Get all users who have chats today
        $usersWithChatsToday = WaChat::whereBetween('created_at', [$today, $now])
            ->select('user_id')
            ->distinct()
            ->pluck('user_id');
        
        // Get all existing categories for reference
        $existingCategories = WaChatCategory::select('id', 'name', 'description')
            ->get()
            ->toArray();
        
        $results = [];
        
        foreach ($usersWithChatsToday as $userId) {
            // Get user info
            $user = User::find($userId);
            if (!$user) continue;
            
            // Get all today's chats for this user with only needed fields
            $chats = WaChat::where('user_id', $userId)
                ->whereBetween('created_at', [$today, $now])
                ->select('message', 'user_id', 'is_from_me', 'created_at')
                ->orderBy('created_at')
                ->get();
            
            if ($chats->isEmpty()) continue;
            
            // Format chat history for the prompt as JSON
            $chatHistory = json_encode($chats);
            
            // Format existing categories for the prompt
            $categoriesJson = json_encode($existingCategories);
            
            // Create the updated prompt with clearer format instructions
            $prompt = "You are analyzing a WhatsApp conversation with {$user->name} (phone: {$user->phone}) from " . 
                    $today->format('Y-m-d') . ". The chat data is in JSON format, where 'is_from_me' value of 0 means the message is from the user, and 1 means the message is from admin/staff." .
                    "\n\nI need you to create: " .
                    "\n1. A BRIEF summary in Indonesian language (Bahasa Indonesia) that focuses ONLY on the IMPORTANT NOTES or ACTION ITEMS from the conversation. " .
                    "Think of this as short bullet points or notes that a staff member would need to remember about this client's needs, requests, or important information. " .
                    "For example, if the user mentions dietary preferences like 'vegetarian food during trip', specific dates, special requests, complaints, or essential follow-ups, " .
                    "these should be clearly noted. Keep it very concise (max 3-5 short points)." .
                    "\n2. A simple category label in Indonesian for this conversation. Here are the existing categories:\n" . $categoriesJson . 
                    "\n\nIf the conversation fits one of the existing categories, use that category's ID. If not, suggest a new SIMPLE category with a short name (1-3 words) and brief description. " .
                    "Category names should be practical and easy to understand (e.g., 'Keluhan Teknis', 'Permintaan Fitur', 'Info Produk', 'Dukungan Pelanggan')." .
                    
                    "\n\nIMPORTANT FORMATTING INSTRUCTIONS:" .
                    "\n- The 'summary' field MUST be a simple STRING, NOT an array." .
                    "\n- Format the summary as numbered points with newlines (\\n) between points." .
                    "\n- If there are no important notes, just write 'Tidak ada informasi penting atau tindakan yang perlu diambil dari percakapan ini.' as the summary." .
                    "\n- DO NOT use JSON, arrays, or objects within the 'summary' field." .
                    
                    "\n\nReturn your response in this EXACT JSON format:" .
                    "\n{" .
                    "\n  \"summary\": \"1. Point satu.\\n2. Point dua.\\n3. Point tiga.\", // MUST be a STRING, not an array" .
                    "\n  \"category\": {" .
                    "\n    \"use_existing\": true/false," .
                    "\n    \"category_id\": 123,     // Only if use_existing is true" .
                    "\n    \"new_category_name\": \"Simple Category Name\",     // Only if use_existing is false" .
                    "\n    \"new_category_description\": \"Brief description\"     // Only if use_existing is false" .
                    "\n  }" .
                    "\n}" .
                    "\n\nHere's the chat history:\n\n" . $chatHistory;
            
            try {
                // Call Deepseek API for summarization and categorization
                $response = Http::withHeaders([
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Bearer ' . env('DEEPSEEK_API_KEY'),
                ])->post('https://api.deepseek.com/chat/completions', [
                    'model' => 'deepseek-chat',
                    'messages' => [
                        ['role' => 'system', 'content' => 'You are a helpful assistant specialized in creating concise, practical summaries and categorizing conversations accurately. You follow output format instructions precisely. You must always return properly formatted JSON with a summary as a STRING, never as an array. Format multi-point summaries as a single string with numbered points and newlines.'],
                        ['role' => 'user', 'content' => $prompt],
                    ],
                    'stream' => false,
                ]);
                
                if ($response->successful()) {
                    $responseData = json_decode($response->body(), true);
                    $aiResponse = $responseData['choices'][0]['message']['content'];
                    
                    // Extract and parse the JSON from the response
                    try {
                        // Handle potential cases where the response includes extra text around the JSON
                        preg_match('/\{.*\}/s', $aiResponse, $matches);
                        $jsonStr = $matches[0] ?? $aiResponse;
                        $analysisResult = json_decode($jsonStr, true);
                        
                        if (json_last_error() !== JSON_ERROR_NONE) {
                            throw new \Exception("Invalid JSON response: " . json_last_error_msg());
                        }
                        
                        // Validate response structure
                        if (!isset($analysisResult['summary']) || !isset($analysisResult['category'])) {
                            throw new \Exception("Response tidak lengkap: summary atau category tidak ditemukan");
                        }
                        
                        if (!isset($analysisResult['category']['use_existing'])) {
                            throw new \Exception("Response category tidak lengkap: use_existing tidak ditemukan");
                        }
                        
                        // Ensure summary is a string
                        if (is_array($analysisResult['summary'])) {
                            // Fallback handling if still receiving array despite instructions
                            $analysisResult['summary'] = implode("\n", array_map(function($item) {
                                return is_string($item) ? $item : json_encode($item);
                            }, $analysisResult['summary']));
                        }
                        
                        // Process the category
                        $categoryId = null;
                        if ($analysisResult['category']['use_existing']) {
                            // Use existing category
                            $categoryId = $analysisResult['category']['category_id'];
                            
                            // Verify category exists
                            if (!WaChatCategory::where('id', $categoryId)->exists()) {
                                throw new \Exception("Referenced category ID {$categoryId} does not exist");
                            }
                        } else {
                            // Create new category
                            $newCategory = WaChatCategory::create([
                                'name' => $analysisResult['category']['new_category_name'],
                                'description' => $analysisResult['category']['new_category_description'],
                            ]);
                            $categoryId = $newCategory->id;
                        }
                        
                        // Format date properly
                        $formattedDate = Carbon::parse($today)->format('Y-m-d');
                        
                        // Store the summary with category in the database using a more explicit approach
                        $summary = new WaChatSummary();
                        $summary->user_id = $userId;
                        $summary->date = $formattedDate;
                        $summary->summary = $analysisResult['summary'];
                        $summary->category_id = $categoryId;
                        $summary->chat_count = $chats->count();
                        $summary->save();
                        
                        $results[] = [
                            'user_id' => $userId,
                            'name' => $user->name,
                            'phone' => $user->phone,
                            'chat_count' => $chats->count(),
                            'summary' => $analysisResult['summary'],
                            'category_id' => $categoryId,
                            'category_name' => $analysisResult['category']['use_existing'] ? 
                                WaChatCategory::find($categoryId)->name : 
                                $analysisResult['category']['new_category_name'],
                            'is_new_category' => !$analysisResult['category']['use_existing'],
                            'status' => 'success'
                        ];
                    } catch (\Exception $e) {
                        Log::error('JSON parsing error for user ' . $userId, [
                            'exception' => $e->getMessage(),
                            'response' => $aiResponse
                        ]);
                        
                        $results[] = [
                            'user_id' => $userId,
                            'name' => $user->name,
                            'phone' => $user->phone,
                            'status' => 'error',
                            'error' => 'JSON parsing error: ' . $e->getMessage()
                        ];
                    }
                } else {
                    // Log the error
                    Log::error('Deepseek API error for user ' . $userId, [
                        'response' => json_decode($response->body(), true),
                        'status' => $response->status()
                    ]);
                    
                    $results[] = [
                        'user_id' => $userId,
                        'name' => $user->name,
                        'phone' => $user->phone,
                        'status' => 'error',
                        'error' => 'API error: ' . $response->status()
                    ];
                }
            } catch (\Exception $e) {
                Log::error('Exception in chat summary for user ' . $userId, [
                    'exception' => $e->getMessage()
                ]);
                
                $results[] = [
                    'user_id' => $userId,
                    'name' => $user->name,
                    'phone' => $user->phone,
                    'status' => 'error',
                    'error' => 'Exception: ' . $e->getMessage()
                ];
            }
        }
        
        return $results;
    }
}
