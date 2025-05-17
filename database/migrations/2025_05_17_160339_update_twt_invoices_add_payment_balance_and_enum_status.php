<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class UpdateTwtInvoicesAddPaymentBalanceAndEnumStatus extends Migration
{
    public function up()
    {
        Schema::table('twt_invoices', function (Blueprint $table) {
            // Tambah kolom payment dan balance setelah grand_total
            $table->decimal('payment', 15, 2)->default(0)->after('grand_total');
            $table->decimal('balance', 15, 2)->default(0)->after('payment');

            // Ubah kolom status menjadi enum
            $table->enum('status', ['unpaid', 'paid_partially', 'paid'])->default('unpaid')->change();
        });
    }

    public function down()
    {
        Schema::table('twt_invoices', function (Blueprint $table) {
            // Kembalikan status ke string biasa (asumsi sebelumnya string/varchar)
            $table->string('status')->change();

            // Hapus kolom payment dan balance
            $table->dropColumn(['payment', 'balance']);
        });
    }
}
