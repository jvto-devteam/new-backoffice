<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('crew_roles', function (Blueprint $table) {
            $table->decimal('rate_twt', 10, 2)->nullable()->after('rate');
        });
    }

    public function down(): void
    {
        Schema::table('crew_roles', function (Blueprint $table) {
            $table->dropColumn('rate_twt');
        });
    }
};
