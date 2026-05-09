# BCA Email Crew Transfer Auto-Sync — Design Spec
**Date:** 2026-05-09  
**Status:** Approved

## Problem

After transferring crew expenses via KlikBCA Bisnis, the system sends notification emails to `javavolcano.rendezvous@gmail.com`. Currently, marking a booking's crew expense as "transferred" must be done manually. This design automates that process by polling Gmail and parsing BCA notification emails.

---

## Overview

A Laravel scheduled command polls Gmail every 30 minutes for new emails from `klikbcabisnis@klikbca.com`. It parses the transaction details, matches the booking by the code in the `Keterangan/Remark` field, and records the transfer in a new `bca_crew_transfers` table. Transfers with a remark that does not match any booking are silently ignored — they are assumed to be non-crew transfers. The UI reflects transfer status in the Expense Manager (per booking) and the Booking Overview list.

---

## Email Format

Each BCA notification email contains one transaction block (Indonesian + English copy). Multiple releases on the same day produce multiple separate emails.

**Key fields parsed:**

| Email Field | Field Name | Example |
|-------------|------------|---------|
| Tanggal / Date | `transfer_date` | 07/05/2026 |
| Jam / Time | `transfer_time` | 22:02:28 |
| Ke Rekening / To Account | `to_account` | 620101011921530 |
| Bank | `to_bank` | PT. BANK RAKYAT INDONESIA (PERSERO) |
| Nominal / Amount | `amount` | 2310000 |
| Biaya / Charges | `fee` | 2500 (nullable) |
| Keterangan / Remark | `remark` | SJZ889181 Qisheng Weng |
| No Referensi / Reference No | `reference_no` | 26050702635190 |
| Status | `status` | Berhasil / Success |

Only emails with Status = `Berhasil` or `Success` are processed.

---

## Booking Matching

1. Extract the first word from `Keterangan` → `booking_code_matched`
2. If `Keterangan` is empty or blank → **skip entirely** (non-crew transfer)
3. Query: `Booking::where('booking_code', $code)->first()`
4. If not found: `Booking::where('invoice_code_origin', $code)->first()`
5. If found → set `booking_id` on the transfer record, save it
6. If not found → **skip entirely, do not save** (non-crew transfer, log as debug only)

---

## Database

### New table: `bca_crew_transfers`

| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| booking_id | bigint FK | always matched — records without a match are discarded |
| transfer_date | date | |
| transfer_time | time | |
| amount | bigint | in IDR (e.g., 2310000) |
| fee | bigint nullable | transfer fee in IDR |
| to_account | varchar | recipient account number |
| to_bank | varchar nullable | recipient bank name |
| reference_no | varchar unique | BCA reference number |
| remark | varchar | full keterangan text |
| booking_code_matched | varchar | first word from remark |
| email_message_id | varchar unique | Gmail message ID (dedup) |
| email_received_at | timestamp | |
| created_at / updated_at | timestamps | |

No changes to the `bookings` table. Transfer status is derived via the `bcaCrewTransfers` relationship.

---

## Backend Components

### 1. `GmailService` (`app/Services/GmailService.php`)

Wraps Google API Client for Gmail.

**Setup (one-time):**
- `php artisan gmail:setup` — opens OAuth2 URL, user authorizes, stores refresh_token in `.env` as `GMAIL_REFRESH_TOKEN`

**Methods:**
- `fetchBcaEmails(int $maxResults = 50): array` — search Gmail for emails from `klikbcabisnis@klikbca.com` with label `UNREAD` (or custom label `bca-not-processed`)
- `markAsProcessed(string $messageId): void` — add Gmail label `bca-processed` to message

**Dependencies:**
- `google/apiclient` via Composer
- Credentials: `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN` in `.env`

### 2. `BcaEmailParser` (`app/Services/BcaEmailParser.php`)

Parses raw email body text into structured data.

**Method:**
- `parse(string $emailBody): array` — returns `[transfer_date, transfer_time, to_account, to_bank, amount, fee, remark, reference_no, status]`

**Strategy:**
- Use regex on the English section of the email (more consistent casing)
- Patterns target `Amount`, `To Account`, `Remark`, `Reference No`, `Status`, etc.
- Returns `null` if status is not `Success`/`Berhasil`

### 3. `SyncBcaTransferEmails` command (`app/Console/Commands/SyncBcaTransferEmails.php`)

**Command:** `php artisan bca:sync-transfers`

**Flow:**
1. Call `GmailService::fetchBcaEmails()`
2. For each email:
   a. Check if `email_message_id` already exists in `bca_crew_transfers` → skip if yes
   b. Parse email body via `BcaEmailParser::parse()`
   c. Skip if status is not success
   d. Skip if `Keterangan` is empty
   e. Match booking via `booking_code_matched`
   f. Skip (log debug) if no booking found — non-crew transfer
   g. Create `BcaCrewTransfer` record
   h. Call `GmailService::markAsProcessed()`
3. Log summary: `X new transfers recorded, Y skipped (no booking match)`

**Scheduler registration in `app/Console/Kernel.php`:**
```php
$schedule->command('bca:sync-transfers')->everyThirtyMinutes();
```

### 4. `BcaCrewTransfer` model (`app/Models/BcaCrewTransfer.php`)

- `belongsTo(Booking::class)`
- Cast `transfer_date` as date, `amount`/`fee` as integer

---

## API / Controller

### `BcaTransferController` (`app/Http/Controllers/BcaTransferController.php`)

**Routes (in `routes/web.php`):**

| Method | URI | Purpose |
|--------|-----|---------|
| GET | `/finance/bca-transfers` | List all matched transfers (with search/filter by date/booking) |

### Updates to `FinanceController`

In `editExpense()`, include `bcaCrewTransfers` relationship data alongside existing booking data.

---

## UI Components

### A. Expense Manager (`EditExpenseManager.tsx`)

New section: **"Crew Transfer Records"**

- Displayed after existing expense sections
- Shows a table of all `bca_crew_transfers` for the booking:
  - Date, Amount (Rp formatted), Bank → Account, Reference No
- If no transfers: show "No transfer records yet"
- Non-editable (read-only display)

### B. Booking Overview list

- Add a new column or badge: **"Transferred"**
- If booking has ≥1 `bca_crew_transfers`: show green badge with total transferred amount
- If no transfers: show empty / grey dash

### C. BCA Transfer Log page (new)

Route: `/finance/bca-transfers`

- Table of all matched transfers (date, booking code, customer name, amount, bank, reference no)
- Filter by date range
- No manual assignment needed — unmatched transfers are silently discarded

---

## Gmail OAuth2 Setup Flow (one-time)

1. Developer runs `php artisan gmail:setup`
2. Terminal outputs an authorization URL
3. Developer opens URL in browser, signs in with `javavolcano.rendezvous@gmail.com`, grants access
4. Google redirects to callback with auth code
5. Command exchanges auth code for tokens, saves `GMAIL_REFRESH_TOKEN` to `.env`
6. Future scheduler runs use this refresh token to get fresh access tokens automatically

---

## Error Handling

| Scenario | Handling |
|----------|----------|
| Gmail API rate limit | Retry with exponential backoff in GmailService |
| Email parsing fails | Log warning, skip email, do not mark as processed |
| Booking not found / empty remark | Skip silently, log as debug — assumed non-crew transfer |
| Duplicate reference_no | DB unique constraint catches it, command skips silently |
| OAuth token expired | `google/apiclient` handles refresh automatically via refresh_token |

---

## Dependencies

- `composer require google/apiclient:^2.0`
- Google Cloud Console: create project, enable Gmail API, create OAuth2 Web Client credentials
- `.env` vars: `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`

---

## Out of Scope

- Per-crew matching (which specific crew was paid)
- Automated reconciliation of transfer amounts vs expected crew subtotals
- Push notifications / real-time (polling every 30 min is sufficient)
- Modifying BCA email format assumptions
