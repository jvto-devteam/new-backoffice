<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('room_hotels', function (Blueprint $table) {
            $table->decimal('rate_twt', 10, 2)->after('rate')->nullable();
        });

        Schema::table('hotels', function (Blueprint $table) {
            $table->decimal('lunch_rate_twt', 10, 2)->after('lunch_rate')->nullable();
            $table->decimal('dinner_rate_twt', 10, 2)->after('dinner_rate')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('room_hotels', function (Blueprint $table) {
            $table->dropColumn('rate_twt');
        });

        Schema::table('hotels', function (Blueprint $table) {
            $table->dropColumn('lunch_rate_twt');
            $table->dropColumn('dinner_rate_twt');
        });
    }
};
