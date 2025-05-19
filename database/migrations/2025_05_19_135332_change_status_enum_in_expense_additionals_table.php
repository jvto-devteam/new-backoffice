<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Normalisasi data lama agar sesuai enum baru
        DB::table('expense_additionals')
            ->whereNotIn('status', ['pending', 'submitted', 'invoiced'])
            ->update(['status' => 'pending']);

        // Ubah enum status
        DB::statement("ALTER TABLE expense_additionals MODIFY status ENUM('pending', 'submitted', 'invoiced') NOT NULL DEFAULT 'pending'");
    }

    public function down(): void
    {
        // Rollback ke enum sebelumnya — sesuaikan dengan enum lama kamu
        DB::statement("ALTER TABLE expense_additionals MODIFY status ENUM('draft', 'approved', 'rejected') NOT NULL DEFAULT 'draft'");
    }
};
