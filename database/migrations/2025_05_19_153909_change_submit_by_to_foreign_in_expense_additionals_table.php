<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('expense_additionals', function (Blueprint $table) {
            $table->dropColumn('submit_by');

            // Ubah dulu ke unsignedBigInteger (jika belum)
            $table->unsignedBigInteger('submit_by')->after('submit_date')->nullable();

            // Tambahkan foreign key constraint
            $table->foreign('submit_by')->references('id')->on('guide_drivers')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::table('expense_additionals', function (Blueprint $table) {
            // Drop foreign key constraint terlebih dahulu
            $table->dropForeign(['submit_by']);

            // Kembalikan ke tipe sebelumnya (ubah jika sebelumnya bukan bigInteger)
            $table->string('submit_by')->nullable();
        });
    }
};
