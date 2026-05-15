<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->enum('crew_transfer_status', ['pending', 'transferred'])
                  ->default('pending')
                  ->after('total_expense_debt_paid');
            $table->date('crew_transfer_date')->nullable()->after('crew_transfer_status');
            $table->string('crew_transfer_proof')->nullable()->after('crew_transfer_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['crew_transfer_status', 'crew_transfer_date', 'crew_transfer_proof']);
        });
    }
};
