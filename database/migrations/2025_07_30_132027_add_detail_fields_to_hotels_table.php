<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('hotels', function (Blueprint $table) {
            $table->text('short_description')->nullable()->after('booking_code');
            $table->decimal('rating', 3, 2)->nullable()->after('short_description'); // contoh: 4.75
            $table->longText('description')->nullable()->after('rating');
            $table->longText('facilities')->nullable()->after('description');
        });
    }

    public function down(): void
    {
        Schema::table('hotels', function (Blueprint $table) {
            $table->dropColumn([
                'short_description',
                'rating',
                'description',
                'facilities'
            ]);
        });
    }
};
