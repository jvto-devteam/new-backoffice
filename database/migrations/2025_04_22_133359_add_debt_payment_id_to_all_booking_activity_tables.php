<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // book_hotels
        Schema::table('book_hotels', function (Blueprint $table) {
            $table->unsignedBigInteger('debt_payment_id')->nullable()->after('is_debt');
            $table->foreign('debt_payment_id')->references('id')->on('debt_payments')->nullOnDelete();
        });

        // book_destination_activities
        Schema::table('book_destination_activities', function (Blueprint $table) {
            $table->unsignedBigInteger('debt_payment_id')->nullable()->after('is_debt');
            $table->foreign('debt_payment_id')->references('id')->on('debt_payments')->nullOnDelete();
        });

        // book_car_activities
        Schema::table('book_car_activities', function (Blueprint $table) {
            $table->unsignedBigInteger('debt_payment_id')->nullable()->after('is_debt');
            $table->foreign('debt_payment_id')->references('id')->on('debt_payments')->nullOnDelete();
        });

        // book_others_activities
        Schema::table('book_others_activities', function (Blueprint $table) {
            $table->unsignedBigInteger('debt_payment_id')->nullable()->after('is_debt');
            $table->foreign('debt_payment_id')->references('id')->on('debt_payments')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('book_hotels', function (Blueprint $table) {
            $table->dropForeign(['debt_payment_id']);
            $table->dropColumn('debt_payment_id');
        });

        Schema::table('book_destination_activities', function (Blueprint $table) {
            $table->dropForeign(['debt_payment_id']);
            $table->dropColumn('debt_payment_id');
        });

        Schema::table('book_car_activities', function (Blueprint $table) {
            $table->dropForeign(['debt_payment_id']);
            $table->dropColumn('debt_payment_id');
        });

        Schema::table('book_others_activities', function (Blueprint $table) {
            $table->dropForeign(['debt_payment_id']);
            $table->dropColumn('debt_payment_id');
        });
    }
};
