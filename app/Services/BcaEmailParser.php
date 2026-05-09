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
     * Parse "Rp 2,310,000.00" → integer IDR (2310000).
     */
    private function parseRupiah(string $value): int
    {
        $clean = preg_replace('/[^0-9,.]/', '', $value);
        $beforeDecimal = explode('.', str_replace(',', '', $clean))[0];
        return (int) $beforeDecimal;
    }
}
