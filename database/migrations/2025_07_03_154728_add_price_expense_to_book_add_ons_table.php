<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('book_add_ons', function (Blueprint $table) {
            $table->double('price_expense')->default(0)->after('price');
        });
    }

    public function down(): void
    {
        Schema::table('book_add_ons', function (Blueprint $table) {
            $table->dropColumn('price_expense');
        });
    }
};
