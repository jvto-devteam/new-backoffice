<?php

namespace Tests\Feature;

use App\Models\BcaCrewTransfer;
use App\Models\Booking;
use App\Services\GmailService;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Tests\TestCase;

class SyncBcaTransferEmailsTest extends TestCase
{
    use DatabaseTransactions;

    protected function setUp(): void
    {
        parent::setUp();
        // Start with clean slate — delete any leftover data from previous runs
        \DB::table('bca_crew_transfers')->delete();
    }

    private function makeEmailBody(array $overrides = []): string
    {
        $fields = array_merge([
            'Date'         => '07/05/2026',
            'Time'         => '22:02:28',
            'To Account'   => '620101011921530',
            'Bank'         => 'PT. BANK RAKYAT INDONESIA (PERSERO)',
            'Amount'       => 'Rp 2,310,000.00',
            'Remark'       => 'SJZ889181 Qisheng Weng',
            'Reference No' => '26050702635190',
            'Status'       => 'Success',
        ], $overrides);

        return implode("\n", array_map(
            fn($k, $v) => "{$k}\t:\t{$v}",
            array_keys($fields),
            array_values($fields)
        ));
    }

    public function test_creates_transfer_record_when_booking_code_matches(): void
    {
        $booking = Booking::factory()->create(['booking_code' => 'SJZ889181']);

        $this->mock(GmailService::class, function ($mock) {
            $mock->shouldReceive('fetchBcaEmails')->once()->andReturn([[
                'message_id'  => 'msg_001',
                'body'        => $this->makeEmailBody(),
                'received_at' => '2026-05-07 22:10:00',
            ]]);
        });

        $this->artisan('bca:sync-transfers')->assertExitCode(0);

        $this->assertDatabaseHas('bca_crew_transfers', [
            'booking_id'   => $booking->id,
            'reference_no' => '26050702635190',
            'amount'       => 2310000,
            'to_account'   => '620101011921530',
        ]);
    }

    public function test_matches_by_invoice_code_origin_for_klook_bookings(): void
    {
        $booking = Booking::factory()->create([
            'booking_code'        => 'JVTO001',
            'invoice_code_origin' => 'KCP730165',
        ]);

        $body = $this->makeEmailBody([
            'To Account'   => '506-5368541',
            'Amount'       => 'Rp 770,000.00',
            'Remark'       => 'KCP730165 Rui Bin Lee',
            'Reference No' => '26050700635723',
        ]);

        $this->mock(GmailService::class, function ($mock) use ($body) {
            $mock->shouldReceive('fetchBcaEmails')->once()->andReturn([[
                'message_id'  => 'msg_002',
                'body'        => $body,
                'received_at' => '2026-05-08 02:50:00',
            ]]);
        });

        $this->artisan('bca:sync-transfers')->assertExitCode(0);

        $this->assertDatabaseHas('bca_crew_transfers', [
            'booking_id'           => $booking->id,
            'booking_code_matched' => 'KCP730165',
            'amount'               => 770000,
        ]);
    }

    public function test_skips_email_when_no_booking_match(): void
    {
        $this->mock(GmailService::class, function ($mock) {
            $mock->shouldReceive('fetchBcaEmails')->once()->andReturn([[
                'message_id'  => 'msg_003',
                'body'        => $this->makeEmailBody(['Remark' => 'UNKNOWN999 Some Person']),
                'received_at' => '2026-05-07 10:00:00',
            ]]);
        });

        $this->artisan('bca:sync-transfers')->assertExitCode(0);

        $this->assertDatabaseCount('bca_crew_transfers', 0);
    }

    public function test_skips_email_with_empty_remark(): void
    {
        $this->mock(GmailService::class, function ($mock) {
            $mock->shouldReceive('fetchBcaEmails')->once()->andReturn([[
                'message_id'  => 'msg_004',
                'body'        => $this->makeEmailBody(['Remark' => '']),
                'received_at' => '2026-05-07 10:00:00',
            ]]);
        });

        $this->artisan('bca:sync-transfers')->assertExitCode(0);
        $this->assertDatabaseCount('bca_crew_transfers', 0);
    }

    public function test_skips_duplicate_message_id(): void
    {
        $booking = Booking::factory()->create(['booking_code' => 'SJZ889181']);

        BcaCrewTransfer::create([
            'booking_id'           => $booking->id,
            'transfer_date'        => '2026-05-07',
            'transfer_time'        => '22:02:28',
            'amount'               => 2310000,
            'to_account'           => '620101011921530',
            'reference_no'         => 'REF_EXISTING',
            'remark'               => 'SJZ889181 Qisheng Weng',
            'booking_code_matched' => 'SJZ889181',
            'email_message_id'     => 'msg_005',
        ]);

        $this->mock(GmailService::class, function ($mock) {
            $mock->shouldReceive('fetchBcaEmails')->once()->andReturn([[
                'message_id'  => 'msg_005',
                'body'        => $this->makeEmailBody(['Reference No' => 'REF_NEW']),
                'received_at' => '2026-05-07 22:10:00',
            ]]);
        });

        $this->artisan('bca:sync-transfers')->assertExitCode(0);

        $this->assertDatabaseCount('bca_crew_transfers', 1);
    }

    public function test_outputs_summary_counts(): void
    {
        Booking::factory()->create(['booking_code' => 'SJZ889181']);

        $this->mock(GmailService::class, function ($mock) {
            $mock->shouldReceive('fetchBcaEmails')->once()->andReturn([
                ['message_id' => 'msg_006', 'body' => $this->makeEmailBody(), 'received_at' => '2026-05-07 22:10:00'],
                ['message_id' => 'msg_007', 'body' => $this->makeEmailBody(['Remark' => 'NOMATCH Vendor', 'Reference No' => '999']), 'received_at' => '2026-05-07 22:11:00'],
            ]);
        });

        $this->artisan('bca:sync-transfers')
            ->expectsOutputToContain('1 recorded, 1 skipped')
            ->assertExitCode(0);
    }
}
