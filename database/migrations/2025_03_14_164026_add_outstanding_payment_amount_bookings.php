<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->double('outstanding_payment_amount')->nullable()->after('outstanding_payment_link');
            $table->double('outstanding_payment_fees')->nullable()->after('outstanding_payment_amount');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['outstanding_payment_amount', 'outstanding_payment_fees']);
        });
    }
};
