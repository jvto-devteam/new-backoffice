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
