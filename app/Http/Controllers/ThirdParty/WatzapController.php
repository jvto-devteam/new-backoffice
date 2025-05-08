<?php

namespace App\Http\Controllers\ThirdParty;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\WaChat;
use App\Models\WaChatIgnore;
use Illuminate\Http\Request;
use Carbon\Carbon;

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
    
}
