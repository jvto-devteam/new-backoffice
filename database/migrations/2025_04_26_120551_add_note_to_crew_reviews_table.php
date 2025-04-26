<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('crew_reviews', function (Blueprint $table) {
            $table->string('note')->nullable()->after('rate');
        });
    }

    public function down(): void
    {
        Schema::table('crew_reviews', function (Blueprint $table) {
            $table->dropColumn('note');
        });
    }
};
