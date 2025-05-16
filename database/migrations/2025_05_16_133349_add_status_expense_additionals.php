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
        Schema::table('expense_additionals', function (Blueprint $table) {
            $table->enum('status',['pending', 'approved', 'rejected'])->default('pending')->after('submit_by'); // status revisi
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('expense_additionals', function (Blueprint $table) {
            $table->dropColumn('status'); // status revisi
        });
    }
};
