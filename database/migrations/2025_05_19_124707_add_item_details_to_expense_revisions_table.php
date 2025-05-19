<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddItemDetailsToExpenseRevisionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('expense_revisions', function (Blueprint $table) {
            $table->dropColumn('item_id');
            $table->dropColumn('item_id_source');

            $table->string('item_id')->nullable()->after('item');
            $table->string('item_value')->nullable()->after('item_id');
            $table->string('item_source')->nullable()->after('item_value');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('expense_revisions', function (Blueprint $table) {
            $table->dropColumn('item_id');
            $table->dropColumn('item_value');
            $table->dropColumn('item_source');

            $table->unsignedBigInteger('item_id')->nullable()->after('booking_id'); // mengacu ke salah satu dari banyak table
            $table->string('item_id_source')->nullable()->after('item_id'); // nama tabel sumber item_id

        });
    }
}