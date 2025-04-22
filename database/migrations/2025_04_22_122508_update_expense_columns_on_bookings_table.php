<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->renameColumn('total_expense_paid', 'total_expense_crew');
            $table->integer('total_expense_debt_paid')->default(0)->after('total_expense_debt');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->renameColumn('total_expense_crew', 'total_expense_paid');
            $table->dropColumn('total_expense_debt_paid');
        });
    }
};
