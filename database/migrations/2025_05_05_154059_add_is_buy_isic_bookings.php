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
            $table->enum('is_buy_isic', ['0', '1'])->default('0')->after('grand_total');
            $table->enum('is_buy_isic_complete_form', ['0', '1'])->default('0')->after('is_buy_isic');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn('is_buy_isic');
            $table->dropColumn('is_buy_isic_complete_form');
        });
    }
};
