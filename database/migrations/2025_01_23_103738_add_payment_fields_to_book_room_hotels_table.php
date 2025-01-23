<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddPaymentFieldsToBookRoomHotelsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('book_room_hotels', function (Blueprint $table) {
            $table->enum('status_paid', ['paid', 'unpaid'])->nullable();
            $table->dateTime('paid_date')->nullable()->after('status_paid');
            $table->enum('is_debt', ['0', '1'])->nullable()->after('paid_date');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('book_room_hotels', function (Blueprint $table) {
            $table->dropColumn(['status_paid', 'paid_date', 'is_debt']);
        });
    }
}
