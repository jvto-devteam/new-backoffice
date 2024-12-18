<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddRoomHotelCodeToRoomHotelsTable extends Migration
{
    public function up()
    {
        Schema::table('room_hotels', function (Blueprint $table) {
            $table->string('room_hotel_code')->after('id');
        });
    }

    public function down()
    {
        Schema::table('room_hotels', function (Blueprint $table) {
            $table->dropColumn('room_hotel_code');
        });
    }
}
