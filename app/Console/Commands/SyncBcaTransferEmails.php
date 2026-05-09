<?php

namespace App\Console\Commands;

use App\Models\BcaCrewTransfer;
use App\Models\Booking;
use App\Services\BcaEmailParser;
use App\Services\GmailService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class SyncBcaTransferEmails extends Command
{
    protected $signature = 'bca:sync-transfers';
    protected $description = 'Sync BCA KlikBCA Bisnis notification emails to crew expense transfer records';

    public function handle(GmailService $gmail, BcaEmailParser $parser): int
    {
        $emails   = $gmail->fetchBcaEmails();
        $recorded = 0;
        $skipped  = 0;

        foreach ($emails as $email) {
            if (BcaCrewTransfer::where('email_message_id', $email['message_id'])->exists()) {
                continue;
            }

            $data = $parser->parse($email['body']);

            if (!$data) {
                Log::debug('bca:sync — parse failed', ['message_id' => $email['message_id']]);
                continue;
            }

            if (empty(trim($data['remark']))) {
                Log::debug('bca:sync — empty remark, skipping', ['reference_no' => $data['reference_no']]);
                continue;
            }

            $bookingCode = explode(' ', trim($data['remark']))[0];

            $booking = Booking::where('booking_code', $bookingCode)->first()
                ?? Booking::where('invoice_code_origin', $bookingCode)->first();

            if (!$booking) {
                Log::debug('bca:sync — no booking match, non-crew transfer', [
                    'remark'       => $data['remark'],
                    'reference_no' => $data['reference_no'],
                ]);
                $skipped++;
                continue;
            }

            BcaCrewTransfer::create([
                'booking_id'           => $booking->id,
                'transfer_date'        => $data['transfer_date'],
                'transfer_time'        => $data['transfer_time'],
                'amount'               => $data['amount'],
                'fee'                  => $data['fee'],
                'to_account'           => $data['to_account'],
                'to_bank'              => $data['to_bank'],
                'reference_no'         => $data['reference_no'],
                'remark'               => $data['remark'],
                'booking_code_matched' => $bookingCode,
                'email_message_id'     => $email['message_id'],
                'email_received_at'    => $email['received_at'],
            ]);

            $recorded++;
        }

        $this->info("BCA sync complete: {$recorded} recorded, {$skipped} skipped (no booking match)");
        Log::info("bca:sync complete: {$recorded} recorded, {$skipped} skipped");

        return self::SUCCESS;
    }
}
