<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('book_crew_activities', function (Blueprint $table) {
            $table->unsignedBigInteger('debt_payment_id')->nullable()->after('is_debt');
            $table->foreign('debt_payment_id')->references('id')->on('debt_payments')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('book_crew_activities', function (Blueprint $table) {
            $table->dropForeign(['debt_payment_id']);
            $table->dropColumn('debt_payment_id');
        });
    }
};
