<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('files', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->string('original_name', 255);
            $table->foreignId('folder_id')->constrained('folders')->onDelete('cascade');
            $table->foreignId('file_type_id')->nullable()->constrained('file_types');
            $table->bigInteger('size');
            $table->string('path', 1000);
            $table->string('mime_type', 100)->nullable();
            $table->jsonb('metadata')->nullable();
            $table->timestampsTz();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('files');
    }
};
