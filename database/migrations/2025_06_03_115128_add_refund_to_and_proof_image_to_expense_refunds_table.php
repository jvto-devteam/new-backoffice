<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('expense_refunds', function (Blueprint $table) {
            $table->enum('refund_to', ['office', 'customer'])->nullable()->after('item');
            $table->string('proof_image')->nullable()->after('refund_to');
        });
    }

    public function down(): void
    {
        Schema::table('expense_refunds', function (Blueprint $table) {
            $table->dropColumn(['refund_to', 'proof_image']);
        });
    }
};
