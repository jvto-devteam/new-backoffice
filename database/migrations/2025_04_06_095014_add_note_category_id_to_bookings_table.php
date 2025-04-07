<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddNoteCategoryIdToBookingsTable extends Migration
{
    public function up()
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->foreignId('note_category_id')
                  ->nullable()
                  ->constrained('note_categories')
                  ->onDelete('set null')
                  ->after('note'); // Sesuaikan posisi jika perlu
        });
    }

    public function down()
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropForeign(['note_category_id']);
            $table->dropColumn('note_category_id');
        });
    }
}
