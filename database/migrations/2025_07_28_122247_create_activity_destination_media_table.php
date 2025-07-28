<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('activity_destination_medias', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('activity_destination_id');
            $table->string('url');
            $table->enum('type',['image','video']);
            $table->string('alt_text')->nullable();
            $table->string('caption')->nullable();
            $table->timestamps();

            $table->foreign('activity_destination_id')->references('id')->on('activity_destinations')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_destination_medias');
    }
};
