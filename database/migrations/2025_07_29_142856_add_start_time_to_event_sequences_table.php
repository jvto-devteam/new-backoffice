<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('event_sequences', function (Blueprint $table) {
            $table->time('start_time')->nullable()->after('no');
        });
    }

    public function down(): void
    {
        Schema::table('event_sequences', function (Blueprint $table) {
            $table->dropColumn('start_time');
        });
    }
};
