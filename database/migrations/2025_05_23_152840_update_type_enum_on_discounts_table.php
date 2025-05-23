<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        DB::statement("ALTER TABLE discounts MODIFY type ENUM('percent', 'nominal', 'per_pax') NOT NULL DEFAULT 'percent'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE discounts MODIFY type ENUM('percent', 'nominal') NOT NULL DEFAULT 'percent'");
    }
};
