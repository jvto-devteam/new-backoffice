<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Ubah kolom `time` ke string (nullable)
        Schema::table('itinerary_details', function (Blueprint $table) {
            $table->string('time')->nullable()->change();
        });
    }

    public function down(): void
    {
        // Rollback ke tipe time jika dibutuhkan (nullable)
        Schema::table('itinerary_details', function (Blueprint $table) {
            $table->time('time')->nullable()->change();
        });
    }
};
