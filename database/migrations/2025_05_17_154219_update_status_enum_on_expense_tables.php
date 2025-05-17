<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // Update expense_additionals
        DB::statement("ALTER TABLE expense_additionals MODIFY status ENUM('pending', 'invoiced')");

        // Update expense_refunds
        DB::statement("ALTER TABLE expense_refunds MODIFY status ENUM('pending', 'invoiced')");
    }

    public function down(): void
    {
        // Revert back if needed, adjust original values accordingly
        DB::statement("ALTER TABLE expense_additionals MODIFY status ENUM('pending')");
        DB::statement("ALTER TABLE expense_refunds MODIFY status ENUM('pending')");
    }
};
