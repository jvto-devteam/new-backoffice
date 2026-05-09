# BCA Email Crew Transfer Auto-Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Automatically detect BCA KlikBCA Bisnis notification emails and record crew expense transfers against the matching booking — no manual input required.

**Architecture:** A Laravel scheduler (`routes/console.php`) runs `bca:sync-transfers` every 30 minutes. It fetches emails from `klikbcabisnis@klikbca.com` via Gmail API (OAuth2 refresh token), parses each with `BcaEmailParser`, matches the booking by the first word of the `Keterangan/Remark` field against `booking_code` then `invoice_code_origin`, and saves a `BcaCrewTransfer` record. Transfers with no booking match are silently discarded. The `email_message_id` unique constraint prevents duplicates — no email marking needed.

**Tech Stack:** Laravel 11, `google/apiclient ^2.18` (already installed), PHPUnit, React 18 + Inertia.js, Lucide icons.

---

## File Map

**Created:**
- `database/migrations/2026_05_09_000001_create_bca_crew_transfers_table.php`
- `app/Models/BcaCrewTransfer.php`
- `app/Services/BcaEmailParser.php`
- `app/Services/GmailService.php`
- `app/Console/Commands/GmailSetup.php`
- `app/Console/Commands/SyncBcaTransferEmails.php`
- `app/Http/Controllers/BcaTransferController.php`
- `resources/js/Pages/Finance/BcaTransfers.tsx`
- `tests/Unit/BcaEmailParserTest.php`
- `tests/Feature/SyncBcaTransferEmailsTest.php`

**Modified:**
- `config/services.php` — add `gmail` block
- `.env.example` — add Gmail env vars
- `app/Models/Booking.php` — add `bcaCrewTransfers()` relationship
- `routes/console.php` — register `everyThirtyMinutes()` schedule
- `routes/web.php` — add `/finance/bca-transfers` route
- `app/Http/Controllers/FinanceController.php` — two spots: `editExpense()` return array + expense tab map
- `resources/js/Pages/Finance/EditExpenseManager.tsx` — add Crew Transfer Records section
- `resources/js/Pages/Finance/FinanceManager.tsx` — add transfer badge to expense tab rows

---

## Task 1: Gmail Config

**Files:**
- Modify: `config/services.php`
- Modify: `.env.example`

- [ ] **Step 1: Add gmail block to config/services.php**

Open `config/services.php`. Add this block before the closing `];`:

```php
    'gmail' => [
        'client_id'     => env('GMAIL_CLIENT_ID'),
        'client_secret' => env('GMAIL_CLIENT_SECRET'),
        'refresh_token' => env('GMAIL_REFRESH_TOKEN'),
    ],
```

- [ ] **Step 2: Add placeholders to .env.example**

Open `.env.example`. Add these lines at the end:

```
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REFRESH_TOKEN=
```

- [ ] **Step 3: Commit**

```bash
git add config/services.php .env.example
git commit -m "config: add Gmail API service credentials"
```

---

## Task 2: Migration + Models

**Files:**
- Create: `database/migrations/2026_05_09_000001_create_bca_crew_transfers_table.php`
- Create: `app/Models/BcaCrewTransfer.php`
- Modify: `app/Models/Booking.php`

- [ ] **Step 1: Create the migration**

```bash
php artisan make:migration create_bca_crew_transfers_table
```

Rename the generated file to `2026_05_09_000001_create_bca_crew_transfers_table.php` and replace its contents:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bca_crew_transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->date('transfer_date');
            $table->time('transfer_time');
            $table->bigInteger('amount');
            $table->bigInteger('fee')->nullable();
            $table->string('to_account');
            $table->string('to_bank')->nullable();
            $table->string('reference_no')->unique();
            $table->string('remark');
            $table->string('booking_code_matched');
            $table->string('email_message_id')->unique();
            $table->timestamp('email_received_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bca_crew_transfers');
    }
};
```

- [ ] **Step 2: Run the migration**

```bash
php artisan migrate
```

Expected output: `Migrating: 2026_05_09_000001_create_bca_crew_transfers_table` then `Migrated`.

- [ ] **Step 3: Create BcaCrewTransfer model**

Create `app/Models/BcaCrewTransfer.php`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BcaCrewTransfer extends Model
{
    protected $fillable = [
        'booking_id',
        'transfer_date',
        'transfer_time',
        'amount',
        'fee',
        'to_account',
        'to_bank',
        'reference_no',
        'remark',
        'booking_code_matched',
        'email_message_id',
        'email_received_at',
    ];

    protected $casts = [
        'transfer_date'    => 'date',
        'amount'           => 'integer',
        'fee'              => 'integer',
        'email_received_at'=> 'datetime',
    ];

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
```

- [ ] **Step 4: Add relationship to Booking model**

Open `app/Models/Booking.php`. After the last `public function` relationship method, add:

```php
public function bcaCrewTransfers()
{
    return $this->hasMany(BcaCrewTransfer::class, 'booking_id');
}
```

Also add the import at the top of the file with the other `use` statements:

```php
use App\Models\BcaCrewTransfer;
```

- [ ] **Step 5: Commit**

```bash
git add database/migrations/2026_05_09_000001_create_bca_crew_transfers_table.php \
        app/Models/BcaCrewTransfer.php \
        app/Models/Booking.php
git commit -m "feat: add bca_crew_transfers table and models"
```

---

## Task 3: BcaEmailParser Service + Unit Tests

**Files:**
- Create: `tests/Unit/BcaEmailParserTest.php`
- Create: `app/Services/BcaEmailParser.php`

- [ ] **Step 1: Write the failing tests**

Create `tests/Unit/BcaEmailParserTest.php`:

```php
<?php

namespace Tests\Unit;

use App\Services\BcaEmailParser;
use PHPUnit\Framework\TestCase;

class BcaEmailParserTest extends TestCase
{
    private BcaEmailParser $parser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->parser = new BcaEmailParser();
    }

    public function test_parses_english_format_with_bank_and_fee(): void
    {
        $email = implode("\n", [
            'Date	:	07/05/2026',
            'Time	:	22:02:28',
            'Transaction Type	:	FUND TRANSFER',
            'From Account	:	120-0944352',
            'To Account	:	620101011921530',
            'Bank	:	PT. BANK RAKYAT INDONESIA (PERSERO)',
            'Amount	:	Rp 2,310,000.00',
            'Charges	:	Rp 2,500.00',
            'Transfer Type	:	Immediate',
            'Remark	:	SJZ889181 Qisheng Weng',
            'Reference No	:	26050702635190',
            'Status	:	Success',
        ]);

        $result = $this->parser->parse($email);

        $this->assertNotNull($result);
        $this->assertEquals('2026-05-07', $result['transfer_date']);
        $this->assertEquals('22:02:28', $result['transfer_time']);
        $this->assertEquals('620101011921530', $result['to_account']);
        $this->assertEquals('PT. BANK RAKYAT INDONESIA (PERSERO)', $result['to_bank']);
        $this->assertEquals(2310000, $result['amount']);
        $this->assertEquals(2500, $result['fee']);
        $this->assertEquals('SJZ889181 Qisheng Weng', $result['remark']);
        $this->assertEquals('26050702635190', $result['reference_no']);
    }

    public function test_parses_format_without_bank_and_charges(): void
    {
        $email = implode("\n", [
            'Date	:	08/05/2026',
            'Time	:	02:48:21',
            'Transaction Type	:	FUND TRANSFER',
            'From Account	:	120-0944352',
            'To Account	:	506-5368541',
            'Amount	:	Rp 770,000.00',
            'Transfer Type	:	Immediate',
            'Remark	:	KCP730165 Rui Bin Lee',
            'Reference No	:	26050700635723',
            'Status	:	Success',
        ]);

        $result = $this->parser->parse($email);

        $this->assertNotNull($result);
        $this->assertEquals(770000, $result['amount']);
        $this->assertNull($result['to_bank']);
        $this->assertNull($result['fee']);
        $this->assertEquals('KCP730165 Rui Bin Lee', $result['remark']);
    }

    public function test_parses_indonesian_format_with_berhasil_status(): void
    {
        $email = implode("\n", [
            'Tanggal	:	06/05/2026',
            'Jam	:	17:53:34',
            'Ke Rekening	:	271-1245822',
            'Nominal	:	Rp 1,258,000.00',
            'Keterangan	:	ECF851287 Piotr Gorecki',
            'No Referensi	:	26050600520360',
            'Status	:	Berhasil',
        ]);

        $result = $this->parser->parse($email);

        $this->assertNotNull($result);
        $this->assertEquals('2026-05-06', $result['transfer_date']);
        $this->assertEquals(1258000, $result['amount']);
        $this->assertEquals('ECF851287 Piotr Gorecki', $result['remark']);
        $this->assertEquals('26050600520360', $result['reference_no']);
    }

    public function test_returns_null_for_failed_status(): void
    {
        $email = implode("\n", [
            'Date	:	07/05/2026',
            'Time	:	10:00:00',
            'To Account	:	12345',
            'Amount	:	Rp 100,000.00',
            'Reference No	:	999',
            'Status	:	Gagal',
        ]);

        $this->assertNull($this->parser->parse($email));
    }

    public function test_returns_null_when_reference_no_missing(): void
    {
        $email = implode("\n", [
            'Date	:	07/05/2026',
            'Time	:	10:00:00',
            'To Account	:	12345',
            'Amount	:	Rp 100,000.00',
            'Status	:	Success',
        ]);

        $this->assertNull($this->parser->parse($email));
    }

    public function test_handles_html_email_with_extra_whitespace(): void
    {
        $email = implode("\n", [
            ' Date  	 : 	  07/05/2026 ',
            ' Time  	 : 	  22:02:28 ',
            ' To Account  	 : 	  620101011921530 ',
            ' Bank  	 : 	  PT. BANK RAKYAT INDONESIA (PERSERO) ',
            ' Amount  	 : 	  Rp 2,310,000.00 ',
            ' Remark  	 : 	  SJZ889181 Qisheng Weng ',
            ' No Referensi  	 : 	  26050702635190 ',
            ' Status  	 : 	  Berhasil ',
        ]);

        $result = $this->parser->parse($email);

        $this->assertNotNull($result);
        $this->assertEquals('2026-05-07', $result['transfer_date']);
        $this->assertEquals(2310000, $result['amount']);
        $this->assertEquals('SJZ889181 Qisheng Weng', $result['remark']);
    }
}
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
./vendor/bin/phpunit tests/Unit/BcaEmailParserTest.php --testdox
```

Expected: All 6 tests FAIL with `Class "App\Services\BcaEmailParser" not found`.

- [ ] **Step 3: Create BcaEmailParser**

Create `app/Services/BcaEmailParser.php`:

```php
<?php

namespace App\Services;

use Carbon\Carbon;

class BcaEmailParser
{
    /**
     * Parse a BCA KlikBCA Bisnis notification email body.
     * Returns null if status is not success or critical fields are missing.
     *
     * @return array{transfer_date:string,transfer_time:string,to_account:string,to_bank:string|null,amount:int,fee:int|null,remark:string,reference_no:string}|null
     */
    public function parse(string $emailBody): ?array
    {
        $text = str_replace(["\r\n", "\r"], "\n", $emailBody);

        $status = $this->extractField($text, ['Status']);
        if (!$status || !preg_match('/^(Success|Berhasil)$/i', trim($status))) {
            return null;
        }

        $date        = $this->extractField($text, ['Date', 'Tanggal']);
        $time        = $this->extractField($text, ['Time', 'Jam']);
        $toAccount   = $this->extractField($text, ['To Account', 'Ke Rekening']);
        $bank        = $this->extractField($text, ['Bank']);
        $amountRaw   = $this->extractField($text, ['Amount', 'Nominal']);
        $feeRaw      = $this->extractField($text, ['Charges', 'Biaya']);
        $remark      = $this->extractField($text, ['Remark', 'Keterangan']);
        $referenceNo = $this->extractField($text, ['Reference No', 'No Referensi']);

        if (!$date || !$toAccount || !$amountRaw || !$referenceNo) {
            return null;
        }

        try {
            $transferDate = Carbon::createFromFormat('d/m/Y', trim($date))->format('Y-m-d');
        } catch (\Exception $e) {
            return null;
        }

        return [
            'transfer_date' => $transferDate,
            'transfer_time' => trim($time ?? '00:00:00'),
            'to_account'    => trim($toAccount),
            'to_bank'       => $bank ? trim($bank) : null,
            'amount'        => $this->parseRupiah($amountRaw),
            'fee'           => $feeRaw ? $this->parseRupiah($feeRaw) : null,
            'remark'        => trim($remark ?? ''),
            'reference_no'  => trim($referenceNo),
        ];
    }

    private function extractField(string $text, array $keys): ?string
    {
        foreach ($keys as $key) {
            if (preg_match('/' . preg_quote($key, '/') . '\s*:\s*(.+)/i', $text, $m)) {
                return trim($m[1]);
            }
        }
        return null;
    }

    /**
     * Parse "Rp 2,310,000.00" or "Rp 770,000.00" → integer IDR (2310000).
     * Strips "Rp", commas, and decimal part.
     */
    private function parseRupiah(string $value): int
    {
        // Remove "Rp", spaces, commas; truncate at decimal point
        $clean = preg_replace('/[^0-9,.]/', '', $value);
        $beforeDecimal = explode('.', str_replace(',', '', $clean))[0];
        return (int) $beforeDecimal;
    }
}
```

- [ ] **Step 4: Run tests again — all should pass**

```bash
./vendor/bin/phpunit tests/Unit/BcaEmailParserTest.php --testdox
```

Expected:
```
BCA Email Parser (Tests\Unit\BcaEmailParser)
 ✔ Parses english format with bank and fee
 ✔ Parses format without bank and charges
 ✔ Parses indonesian format with berhasil status
 ✔ Returns null for failed status
 ✔ Returns null when reference no missing
 ✔ Handles html email with extra whitespace
```

- [ ] **Step 5: Commit**

```bash
git add app/Services/BcaEmailParser.php tests/Unit/BcaEmailParserTest.php
git commit -m "feat: add BcaEmailParser service with unit tests"
```

---

## Task 4: GmailSetup Artisan Command

**Files:**
- Create: `app/Console/Commands/GmailSetup.php`

This is the one-time setup command that walks the developer through OAuth2 authorization and saves the refresh token to `.env`.

- [ ] **Step 1: Create GmailSetup.php**

Create `app/Console/Commands/GmailSetup.php`:

```php
<?php

namespace App\Console\Commands;

use Google\Client;
use Illuminate\Console\Command;

class GmailSetup extends Command
{
    protected $signature = 'gmail:setup';
    protected $description = 'One-time OAuth2 setup to authorize Gmail API access for javavolcano.rendezvous@gmail.com';

    public function handle(): int
    {
        $clientId     = config('services.gmail.client_id');
        $clientSecret = config('services.gmail.client_secret');

        if (!$clientId || !$clientSecret) {
            $this->error('Set GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET in .env first.');
            return self::FAILURE;
        }

        $client = new Client();
        $client->setClientId($clientId);
        $client->setClientSecret($clientSecret);
        $client->setRedirectUri('http://localhost');
        $client->setScopes(['https://www.googleapis.com/auth/gmail.readonly']);
        $client->setAccessType('offline');
        $client->setPrompt('consent');

        $authUrl = $client->createAuthUrl();

        $this->info('Open this URL in your browser:');
        $this->line('');
        $this->line($authUrl);
        $this->line('');
        $this->info('Sign in as javavolcano.rendezvous@gmail.com and grant access.');
        $this->info('After redirect, copy the "code" value from the URL bar.');
        $this->info('The redirect URL looks like: http://localhost/?code=4%2FXXXXX...');
        $this->line('');

        $authCode = $this->ask('Paste the authorization code here');

        if (!$authCode) {
            $this->error('No code provided.');
            return self::FAILURE;
        }

        $token = $client->fetchAccessTokenWithAuthCode($authCode);

        if (isset($token['error'])) {
            $this->error('OAuth error: ' . ($token['error_description'] ?? $token['error']));
            return self::FAILURE;
        }

        if (!isset($token['refresh_token'])) {
            $this->error('No refresh_token returned. If you already authorized this app, revoke access at https://myaccount.google.com/permissions and run this command again.');
            return self::FAILURE;
        }

        $refreshToken = $token['refresh_token'];
        $this->writeToEnv('GMAIL_REFRESH_TOKEN', $refreshToken);

        $this->info('GMAIL_REFRESH_TOKEN saved to .env successfully!');
        $this->info('You can now run: php artisan bca:sync-transfers');

        return self::SUCCESS;
    }

    private function writeToEnv(string $key, string $value): void
    {
        $envPath    = base_path('.env');
        $envContent = file_get_contents($envPath);

        if (str_contains($envContent, $key . '=')) {
            $envContent = preg_replace('/^' . $key . '=.*/m', $key . '=' . $value, $envContent);
        } else {
            $envContent .= PHP_EOL . $key . '=' . $value . PHP_EOL;
        }

        file_put_contents($envPath, $envContent);
    }
}
```

- [ ] **Step 2: Verify command is discoverable**

```bash
php artisan list | grep gmail
```

Expected: `gmail:setup  One-time OAuth2 setup to authorize Gmail API access`

- [ ] **Step 3: Commit**

```bash
git add app/Console/Commands/GmailSetup.php
git commit -m "feat: add gmail:setup command for one-time OAuth2 authorization"
```

---

## Task 5: GmailService

**Files:**
- Create: `app/Services/GmailService.php`

- [ ] **Step 1: Create GmailService.php**

Create `app/Services/GmailService.php`:

```php
<?php

namespace App\Services;

use Google\Client;
use Google\Service\Gmail;
use Google\Service\Gmail\ModifyMessageRequest;
use Illuminate\Support\Facades\Log;

class GmailService
{
    private Gmail $gmail;

    public function __construct()
    {
        $client = new Client();
        $client->setClientId(config('services.gmail.client_id'));
        $client->setClientSecret(config('services.gmail.client_secret'));
        $client->setScopes(['https://www.googleapis.com/auth/gmail.readonly']);
        $client->setAccessType('offline');

        $newToken = $client->fetchAccessTokenWithRefreshToken(config('services.gmail.refresh_token'));

        if (isset($newToken['error'])) {
            throw new \RuntimeException(
                'Gmail token refresh failed: ' . ($newToken['error_description'] ?? $newToken['error'])
                . ' — run: php artisan gmail:setup'
            );
        }

        $this->gmail = new Gmail($client);
    }

    /**
     * Fetch emails from klikbcabisnis@klikbca.com sent in the last 14 days.
     * Returns array of ['message_id', 'body', 'received_at'].
     */
    public function fetchBcaEmails(int $maxResults = 100): array
    {
        $response = $this->gmail->users_messages->listUsersMessages('me', [
            'q'          => 'from:klikbcabisnis@klikbca.com newer_than:14d',
            'maxResults' => $maxResults,
        ]);

        $messages = $response->getMessages();
        if (!$messages) {
            return [];
        }

        $emails = [];
        foreach ($messages as $message) {
            try {
                $full = $this->gmail->users_messages->get('me', $message->getId(), [
                    'format' => 'full',
                ]);

                $body = $this->extractBody($full);
                $receivedAt = date('Y-m-d H:i:s', intdiv((int) $full->getInternalDate(), 1000));

                $emails[] = [
                    'message_id'  => $message->getId(),
                    'body'        => $body,
                    'received_at' => $receivedAt,
                ];
            } catch (\Exception $e) {
                Log::warning('GmailService: failed to fetch message ' . $message->getId(), [
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return $emails;
    }

    private function extractBody(Gmail\Message $message): string
    {
        $payload = $message->getPayload();
        return $this->findPlainText($payload)
            ?? $this->stripHtml($this->findHtml($payload) ?? '')
            ?? '';
    }

    private function findPlainText(Gmail\MessagePart $part): ?string
    {
        if ($part->getMimeType() === 'text/plain' && $part->getBody()?->getData()) {
            return base64_decode(strtr($part->getBody()->getData(), '-_', '+/'));
        }
        foreach ($part->getParts() ?? [] as $subPart) {
            $result = $this->findPlainText($subPart);
            if ($result !== null) {
                return $result;
            }
        }
        return null;
    }

    private function findHtml(Gmail\MessagePart $part): ?string
    {
        if ($part->getMimeType() === 'text/html' && $part->getBody()?->getData()) {
            return base64_decode(strtr($part->getBody()->getData(), '-_', '+/'));
        }
        foreach ($part->getParts() ?? [] as $subPart) {
            $result = $this->findHtml($subPart);
            if ($result !== null) {
                return $result;
            }
        }
        return null;
    }

    private function stripHtml(string $html): string
    {
        return html_entity_decode(strip_tags($html), ENT_QUOTES, 'UTF-8');
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/Services/GmailService.php
git commit -m "feat: add GmailService to fetch BCA notification emails"
```

---

## Task 6: SyncBcaTransferEmails Command + Scheduler + Feature Tests

**Files:**
- Create: `tests/Feature/SyncBcaTransferEmailsTest.php`
- Create: `app/Console/Commands/SyncBcaTransferEmails.php`
- Modify: `routes/console.php`

- [ ] **Step 1: Write the failing feature tests**

Create `tests/Feature/SyncBcaTransferEmailsTest.php`:

```php
<?php

namespace Tests\Feature;

use App\Models\BcaCrewTransfer;
use App\Models\Booking;
use App\Services\GmailService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SyncBcaTransferEmailsTest extends TestCase
{
    use RefreshDatabase;

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
                'message_id'  => 'msg_005',  // same message_id
                'body'        => $this->makeEmailBody(['Reference No' => 'REF_NEW']),
                'received_at' => '2026-05-07 22:10:00',
            ]]);
        });

        $this->artisan('bca:sync-transfers')->assertExitCode(0);

        $this->assertDatabaseCount('bca_crew_transfers', 1); // no new record
    }

    public function test_outputs_summary_counts(): void
    {
        $booking = Booking::factory()->create(['booking_code' => 'SJZ889181']);

        $this->mock(GmailService::class, function ($mock) {
            $mock->shouldReceive('fetchBcaEmails')->once()->andReturn([
                ['message_id' => 'msg_006', 'body' => $this->makeEmailBody(), 'received_at' => '2026-05-07 22:10:00'],
                ['message_id' => 'msg_007', 'body' => $this->makeEmailBody(['Remark' => 'NOMATCH Vendor', 'Reference No' => '999']), 'received_at' => '2026-05-07 22:11:00'],
            ]);
        });

        $this->artisan('bca:sync-transfers')
            ->expectsOutputToContain('1 recorded')
            ->expectsOutputToContain('1 skipped')
            ->assertExitCode(0);
    }
}
```

- [ ] **Step 2: Check if BookingFactory exists**

```bash
ls /Applications/XAMPP/xamppfiles/htdocs/new-backoffice/database/factories/BookingFactory.php 2>/dev/null && echo "EXISTS" || echo "MISSING"
```

If `MISSING`, create `database/factories/BookingFactory.php` with the minimum fields needed:

```php
<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class BookingFactory extends Factory
{
    public function definition(): array
    {
        return [
            'booking_code'        => strtoupper($this->faker->bothify('???######')),
            'invoice_code_origin' => null,
            'user_id'             => 1,
            'agent_id'            => 2,
            'status'              => 'booked',
            'booking_date'        => now()->format('Y-m-d'),
            'travel_date_start'   => now()->addDays(7)->format('Y-m-d'),
            'travel_date_end'     => now()->addDays(8)->format('Y-m-d'),
            'total_pax'           => 2,
            'grand_total'         => 1000000,
            'package_duration'    => 2,
            'booking_category_id' => 1,
        ];
    }
}
```

Also add `use HasFactory;` to `app/Models/Booking.php` if not already present:
```php
use Illuminate\Database\Eloquent\Factories\HasFactory;
// Inside class:
use HasFactory;
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
./vendor/bin/phpunit tests/Feature/SyncBcaTransferEmailsTest.php --testdox
```

Expected: All tests FAIL with `Class "App\Console\Commands\SyncBcaTransferEmails" not found` or similar.

- [ ] **Step 4: Create SyncBcaTransferEmails command**

Create `app/Console/Commands/SyncBcaTransferEmails.php`:

```php
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
        $emails    = $gmail->fetchBcaEmails();
        $recorded  = 0;
        $skipped   = 0;

        foreach ($emails as $email) {
            // Already processed — skip silently
            if (BcaCrewTransfer::where('email_message_id', $email['message_id'])->exists()) {
                continue;
            }

            $data = $parser->parse($email['body']);

            if (!$data) {
                Log::debug('bca:sync — parse failed', ['message_id' => $email['message_id']]);
                continue;
            }

            // Skip transfers with no remark (non-crew payments)
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
```

- [ ] **Step 5: Run tests — all should pass**

```bash
./vendor/bin/phpunit tests/Feature/SyncBcaTransferEmailsTest.php --testdox
```

Expected: 6 tests pass.

- [ ] **Step 6: Register scheduler in routes/console.php**

Open `routes/console.php`. Add after the existing `Schedule::command(...)` call:

```php
Schedule::command('bca:sync-transfers')
    ->everyThirtyMinutes()
    ->appendOutputTo(storage_path('logs/bca-sync.log'))
    ->description('Sync BCA transfer notification emails to crew expense records');
```

- [ ] **Step 7: Verify command is registered**

```bash
php artisan schedule:list | grep bca
```

Expected: `bca:sync-transfers ... Every 30 minutes`

- [ ] **Step 8: Commit**

```bash
git add app/Console/Commands/SyncBcaTransferEmails.php \
        tests/Feature/SyncBcaTransferEmailsTest.php \
        routes/console.php \
        database/factories/BookingFactory.php  # if created
git commit -m "feat: add bca:sync-transfers command with scheduler and feature tests"
```

---

## Task 7: Expense Manager — Transfer Records Section

**Files:**
- Modify: `app/Http/Controllers/FinanceController.php` (around line 1289)
- Modify: `resources/js/Pages/Finance/EditExpenseManager.tsx`

- [ ] **Step 1: Load transfer records in editExpense()**

Open `app/Http/Controllers/FinanceController.php`. Find the `Inertia::render('Finance/EditExpenseManager', [...])` call (around line 1289). Add `bcaTransfers` to the array:

```php
return Inertia::render('Finance/EditExpenseManager', [
    'additionalRequests' => $additionalRequests,
    'expenseRefund'      => $expenseRefund,
    'booking'            => $booking,
    'accommodations'     => $bookRoom,
    'destinations'       => $destinations,
    'resources'          => $resources,
    'others'             => $others,
    'addOn'              => $bookAddOn,
    'listForNewItems'    => $listForNewItems,
    'paymentHistory'     => $booking->bookingPayment->map(function ($payment) use ($booking) {
        return [
            'id'            => $payment->id,
            'nominal'       => $payment->nominal,
            'paymentMethod' => $payment->paymentMethod->name,
            'description'   => $payment->description,
            'reference'     => $payment->reference,
            'receipt'       => "https://legacy.javavolcano-touroperator.com/backoffice/invoice/view-receipt/" . $booking->id . "/partial/" . $payment->id,
            'date'          => date('d M y H:i', strtotime($payment->created_at)),
        ];
    }),
    'bcaTransfers' => $booking->bcaCrewTransfers()
        ->orderBy('transfer_date', 'desc')
        ->orderBy('transfer_time', 'desc')
        ->get()
        ->map(fn($t) => [
            'id'           => $t->id,
            'transfer_date'=> $t->transfer_date->format('d M Y'),
            'transfer_time'=> $t->transfer_time,
            'amount'       => $t->amount,
            'to_account'   => $t->to_account,
            'to_bank'      => $t->to_bank,
            'reference_no' => $t->reference_no,
            'remark'       => $t->remark,
        ]),
]);
```

Also add the import at the top of FinanceController if not present:
```php
use App\Models\BcaCrewTransfer;
```

- [ ] **Step 2: Add Crew Transfer Records section to EditExpenseManager.tsx**

Open `resources/js/Pages/Finance/EditExpenseManager.tsx`.

Find the props interface/destructuring at the top of the component (where props like `additionalRequests`, `booking`, etc. are received). Add `bcaTransfers` to the props:

```tsx
// Add to the props type/destructuring — find where other props are declared:
bcaTransfers?: Array<{
    id: number;
    transfer_date: string;
    transfer_time: string;
    amount: number;
    to_account: string;
    to_bank: string | null;
    reference_no: string;
    remark: string;
}>;
```

Then find the bottom of the main content (just before the closing `</div>` or `</Authenticated>` tag of the main content area) and add the Crew Transfer Records section:

```tsx
{/* Crew Transfer Records */}
<div className="mt-6 bg-white rounded-lg border p-5">
    <h3 className="text-base font-semibold mb-3 text-gray-800">Crew Transfer Records</h3>
    {bcaTransfers && bcaTransfers.length > 0 ? (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b text-gray-500">
                        <th className="text-left py-2 pr-4 font-medium">Date</th>
                        <th className="text-right py-2 pr-4 font-medium">Amount</th>
                        <th className="text-left py-2 pr-4 font-medium">Bank / Account</th>
                        <th className="text-left py-2 font-medium">Reference No</th>
                    </tr>
                </thead>
                <tbody>
                    {bcaTransfers.map(t => (
                        <tr key={t.id} className="border-b last:border-0">
                            <td className="py-2 pr-4 whitespace-nowrap">{t.transfer_date}</td>
                            <td className="py-2 pr-4 text-right font-mono">
                                {new Intl.NumberFormat('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR',
                                    maximumFractionDigits: 0,
                                }).format(t.amount)}
                            </td>
                            <td className="py-2 pr-4 text-gray-600 text-xs">
                                {t.to_bank && <div className="font-medium text-gray-700">{t.to_bank}</div>}
                                <div>{t.to_account}</div>
                            </td>
                            <td className="py-2 text-gray-400 text-xs font-mono">{t.reference_no}</td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="border-t bg-gray-50">
                        <td className="py-2 pr-4 font-semibold text-sm">Total Transferred</td>
                        <td className="py-2 pr-4 text-right font-mono font-semibold">
                            {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                maximumFractionDigits: 0,
                            }).format(bcaTransfers.reduce((s, t) => s + t.amount, 0))}
                        </td>
                        <td colSpan={2} />
                    </tr>
                </tfoot>
            </table>
        </div>
    ) : (
        <p className="text-gray-400 text-sm">No BCA transfer records found for this booking.</p>
    )}
</div>
```

- [ ] **Step 3: Test in browser**

Open a booking's expense manager page: `http://localhost/new-backoffice/public/finance/expense-manager/{id}/edit`

The "Crew Transfer Records" section should appear at the bottom (empty for bookings with no transfers). For a booking that has transfers (after running `bca:sync-transfers`), the table should show the transfers.

- [ ] **Step 4: Commit**

```bash
git add app/Http/Controllers/FinanceController.php \
        resources/js/Pages/Finance/EditExpenseManager.tsx
git commit -m "feat: show BCA transfer records in expense manager"
```

---

## Task 8: Booking Overview — Transfer Badge

**Files:**
- Modify: `app/Http/Controllers/FinanceController.php` (expense tab query, around line 821)
- Modify: `resources/js/Pages/Finance/FinanceManager.tsx`

- [ ] **Step 1: Eager load bcaCrewTransfers in the expense tab query**

Open `app/Http/Controllers/FinanceController.php`. Find the expense tab query (around line 821):

```php
$booking = Booking::with(['user', 'bookingDetail.package'])->where('travel_date_start', 'like', '%' . $yearMonth . '%');
```

Change to:

```php
$booking = Booking::with(['user', 'bookingDetail.package', 'bcaCrewTransfers'])->where('travel_date_start', 'like', '%' . $yearMonth . '%');
```

- [ ] **Step 2: Add transfer total to the booking map**

In the same method, find the `return [...]` array in the expense tab map (around line 836). Add `total_bca_transferred` to the `'booking'` sub-array:

```php
'booking' => [
    'booking_date'           => $data->booking_date,
    'booking_code'           => $data->booking_code,
    'travel_date_start'      => $data->travel_date_start,
    'travel_date_end'        => $data->travel_date_end,
    'grand_total'            => (int)$data->grand_total,
    'total_expense'          => (int)$data->expense_internal_total,
    'crew_expense'           => (int)$data->total_expense_crew,
    'total_bca_transferred'  => $data->bcaCrewTransfers->sum('amount'),
],
```

- [ ] **Step 3: Add transfer badge in FinanceManager.tsx**

Open `resources/js/Pages/Finance/FinanceManager.tsx`. Find where the expense tab booking rows are rendered. Look for where `booking.crew_expense` or `booking.total_expense` is displayed for each row.

Add the transfer badge next to or below the crew expense amount. Look for the expense tab row rendering and add:

```tsx
{/* After the crew_expense display */}
{booking.booking.total_bca_transferred > 0 && (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        ✓ Transferred{' '}
        {new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(booking.booking.total_bca_transferred)}
    </span>
)}
```

- [ ] **Step 4: Test in browser**

Open the Finance expense tab: `http://localhost/new-backoffice/public/finance?tab=expense`

Bookings that have received BCA transfers should show a green "✓ Transferred Rp X" badge.

- [ ] **Step 5: Commit**

```bash
git add app/Http/Controllers/FinanceController.php \
        resources/js/Pages/Finance/FinanceManager.tsx
git commit -m "feat: show BCA transfer badge in expense overview list"
```

---

## Task 9: BCA Transfer Log Page

**Files:**
- Create: `app/Http/Controllers/BcaTransferController.php`
- Modify: `routes/web.php`
- Create: `resources/js/Pages/Finance/BcaTransfers.tsx`

- [ ] **Step 1: Create BcaTransferController**

Create `app/Http/Controllers/BcaTransferController.php`:

```php
<?php

namespace App\Http\Controllers;

use App\Models\BcaCrewTransfer;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BcaTransferController extends Controller
{
    public function index(Request $request)
    {
        $query = BcaCrewTransfer::with('booking:id,booking_code,invoice_code_origin')
            ->orderBy('transfer_date', 'desc')
            ->orderBy('transfer_time', 'desc');

        if ($request->filled('date_from')) {
            $query->whereDate('transfer_date', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('transfer_date', '<=', $request->date_to);
        }

        $transfers    = $query->paginate(50)->withQueryString();
        $totalAmount  = $query->sum('amount');

        return Inertia::render('Finance/BcaTransfers', [
            'transfers'   => $transfers,
            'totalAmount' => $totalAmount,
            'filters'     => $request->only(['date_from', 'date_to']),
        ]);
    }
}
```

- [ ] **Step 2: Add route in routes/web.php**

Open `routes/web.php`. Find the `Route::prefix('finance')->group(function () {` block. Add inside the group:

```php
Route::get('/bca-transfers', [BcaTransferController::class, 'index']);
```

Also add the import at the top:
```php
use App\Http\Controllers\BcaTransferController;
```

- [ ] **Step 3: Verify route exists**

```bash
php artisan route:list | grep bca-transfers
```

Expected: `GET|HEAD  finance/bca-transfers ...`

- [ ] **Step 4: Create BcaTransfers.tsx**

Create `resources/js/Pages/Finance/BcaTransfers.tsx`:

```tsx
import React, { useState } from "react";
import { router } from "@inertiajs/react";
import Authenticated from "@/Layouts/Main";
import { ArrowLeft } from "lucide-react";

interface Transfer {
    id: number;
    transfer_date: string;
    transfer_time: string;
    amount: number;
    fee: number | null;
    to_account: string;
    to_bank: string | null;
    reference_no: string;
    remark: string;
    booking_code_matched: string;
    booking: { id: number; booking_code: string; invoice_code_origin: string | null } | null;
}

interface Paginated {
    data: Transfer[];
    current_page: number;
    last_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(amount);

export default function BcaTransfers({
    transfers,
    totalAmount,
    filters = {},
}: {
    transfers: Paginated;
    totalAmount: number;
    filters: { date_from?: string; date_to?: string };
}) {
    const [localFilters, setLocalFilters] = useState({
        date_from: filters.date_from ?? "",
        date_to: filters.date_to ?? "",
    });

    const applyFilters = () => {
        router.get(
            "/finance/bca-transfers",
            { date_from: localFilters.date_from || undefined, date_to: localFilters.date_to || undefined },
            { preserveState: true }
        );
    };

    const resetFilters = () => {
        setLocalFilters({ date_from: "", date_to: "" });
        router.get("/finance/bca-transfers", {}, { preserveState: true });
    };

    return (
        <Authenticated>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => router.visit("/finance/expense-manager")}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">BCA Crew Transfer Log</h1>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-end gap-3 mb-5">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">From</label>
                        <input
                            type="date"
                            value={localFilters.date_from}
                            onChange={(e) => setLocalFilters((f) => ({ ...f, date_from: e.target.value }))}
                            className="border rounded px-3 py-1.5 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">To</label>
                        <input
                            type="date"
                            value={localFilters.date_to}
                            onChange={(e) => setLocalFilters((f) => ({ ...f, date_to: e.target.value }))}
                            className="border rounded px-3 py-1.5 text-sm"
                        />
                    </div>
                    <button
                        onClick={applyFilters}
                        className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                        Filter
                    </button>
                    {(filters.date_from || filters.date_to) && (
                        <button
                            onClick={resetFilters}
                            className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 underline"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* Summary */}
                <div className="flex gap-4 mb-4">
                    <div className="bg-blue-50 border border-blue-200 rounded px-4 py-2 text-sm">
                        <span className="text-blue-600 font-medium">{transfers.total}</span>{" "}
                        <span className="text-blue-500">transfers</span>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded px-4 py-2 text-sm">
                        <span className="text-green-600 font-semibold font-mono">{formatRupiah(totalAmount)}</span>{" "}
                        <span className="text-green-500">total</span>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b text-gray-500 text-xs uppercase tracking-wide">
                                <th className="text-left py-3 px-4 font-medium">Date</th>
                                <th className="text-left py-3 px-4 font-medium">Booking</th>
                                <th className="text-left py-3 px-4 font-medium">Customer</th>
                                <th className="text-right py-3 px-4 font-medium">Amount</th>
                                <th className="text-left py-3 px-4 font-medium">Destination Bank</th>
                                <th className="text-left py-3 px-4 font-medium">Reference No</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transfers.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-10 text-gray-400">
                                        No transfers found.
                                    </td>
                                </tr>
                            )}
                            {transfers.data.map((t) => {
                                const customerName = t.remark.includes(" ")
                                    ? t.remark.substring(t.remark.indexOf(" ") + 1)
                                    : "—";
                                return (
                                    <tr key={t.id} className="border-b hover:bg-gray-50 last:border-0">
                                        <td className="py-2.5 px-4 whitespace-nowrap text-gray-600">
                                            {t.transfer_date}
                                            <div className="text-xs text-gray-400">{t.transfer_time}</div>
                                        </td>
                                        <td className="py-2.5 px-4">
                                            {t.booking ? (
                                                <a
                                                    href={`/finance/expense-manager/${t.booking.id}/edit`}
                                                    className="text-blue-600 hover:underline font-mono font-medium"
                                                >
                                                    {t.booking_code_matched}
                                                </a>
                                            ) : (
                                                <span className="font-mono text-gray-500">{t.booking_code_matched}</span>
                                            )}
                                        </td>
                                        <td className="py-2.5 px-4 text-gray-700">{customerName}</td>
                                        <td className="py-2.5 px-4 text-right font-mono font-medium">
                                            {formatRupiah(t.amount)}
                                        </td>
                                        <td className="py-2.5 px-4 text-xs text-gray-500">
                                            {t.to_bank && <div className="text-gray-700">{t.to_bank}</div>}
                                            <div className="font-mono">{t.to_account}</div>
                                        </td>
                                        <td className="py-2.5 px-4 text-xs font-mono text-gray-400">
                                            {t.reference_no}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {transfers.last_page > 1 && (
                    <div className="flex flex-wrap gap-1 mt-4">
                        {transfers.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() => link.url && router.visit(link.url, { preserveState: true })}
                                className={[
                                    "px-3 py-1 text-sm rounded border",
                                    link.active
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "border-gray-300 hover:bg-gray-50 text-gray-700",
                                    !link.url ? "opacity-40 cursor-not-allowed" : "cursor-pointer",
                                ].join(" ")}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </Authenticated>
    );
}
```

- [ ] **Step 5: Test the page in browser**

Open `http://localhost/new-backoffice/public/finance/bca-transfers`

Should render the BCA Transfer Log page. When there are transfers, they show in the table with booking links.

- [ ] **Step 6: Commit**

```bash
git add app/Http/Controllers/BcaTransferController.php \
        routes/web.php \
        resources/js/Pages/Finance/BcaTransfers.tsx
git commit -m "feat: add BCA transfer log page at /finance/bca-transfers"
```

---

## Post-Implementation: OAuth2 Setup Instructions

After all code is deployed, run the one-time Gmail authorization:

```bash
# 1. Make sure GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET are in .env
# 2. Run:
php artisan gmail:setup
# 3. Follow the prompts — open the URL, sign in as javavolcano.rendezvous@gmail.com
# 4. Paste the auth code
# 5. GMAIL_REFRESH_TOKEN will be saved to .env automatically

# Test the sync manually:
php artisan bca:sync-transfers

# Verify Laravel scheduler is running (check cron):
php artisan schedule:run
```

For the scheduler to run automatically, ensure the cron job is set up on the server:
```
* * * * * cd /path/to/project && php artisan schedule:run >> /dev/null 2>&1
```
