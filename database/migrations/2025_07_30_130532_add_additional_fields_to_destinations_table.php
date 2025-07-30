<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('destinations', function (Blueprint $table) {
            $table->text('highlight')->nullable()->after('difficulty');
            $table->text('trek_details')->nullable()->after('highlight');
            $table->text('health_safety')->nullable()->after('trek_details');
            $table->text('requirements')->nullable()->after('health_safety');
        });
    }

    public function down(): void
    {
        Schema::table('destinations', function (Blueprint $table) {
            $table->dropColumn(['highlight', 'trek_details', 'health_safety', 'requirements']);
        });
    }
};
