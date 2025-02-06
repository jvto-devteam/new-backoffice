<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->after('expense_internal_total', function (Blueprint $table) {
                $table->decimal('total_expense_paid', 15, 2)->default(0);
                $table->decimal('total_expense_balance', 15, 2)->default(0);
                $table->decimal('total_expense_debt', 15, 2)->default(0);
            });
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['total_expense_paid', 'total_expense_balance', 'total_expense_debt']);
        });
    }
};
