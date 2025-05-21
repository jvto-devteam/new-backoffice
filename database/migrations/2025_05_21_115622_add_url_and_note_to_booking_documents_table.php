<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('booking_documents', function (Blueprint $table) {
            $table->string('url')->nullable()->after('file');
            $table->text('note')->nullable()->after('url');
        });
    }

    public function down(): void
    {
        Schema::table('booking_documents', function (Blueprint $table) {
            $table->dropColumn(['url', 'note']);
        });
    }
};
