<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddActivityColumnsToItineraryDestinationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('itinerary_destinations', function (Blueprint $table) {
            $table->unsignedBigInteger('activity_id')->nullable()->after('second_destination_id');
            $table->unsignedBigInteger('second_activity_id')->nullable()->after('activity_id');

            $table->foreign('activity_id')->references('id')->on('activities')->onDelete('cascade');
            $table->foreign('second_activity_id')->references('id')->on('activities')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('itinerary_destinations', function (Blueprint $table) {
            $table->dropForeign(['activity_id']);
            $table->dropForeign(['second_activity_id']);

            $table->dropColumn('activity_id');
            $table->dropColumn('second_activity_id');
        });
    }
}
