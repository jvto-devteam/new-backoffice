<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddActivityIdAndDestinationActivityCodeToDestinationActivitiesTable extends Migration
{
    public function up()
    {
        Schema::table('destination_activities', function (Blueprint $table) {
            $table->string('destination_activity_code')->after('id');
            $table->unsignedBigInteger('activity_id')->nullable()->after('destination_id'); // Make it nullable
            $table->foreign('activity_id')->references('id')->on('activities')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::table('destination_activities', function (Blueprint $table) {
            $table->dropForeign(['activity_id']);
            $table->dropColumn('activity_id');
            $table->dropColumn('destination_activity_code');
        });
    }
}
