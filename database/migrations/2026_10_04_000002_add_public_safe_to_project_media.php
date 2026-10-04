<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('project_media', function (Blueprint $table) {
            // Only audited, sanitized source assets may be marked safe by a seeder.
            $table->boolean('public_safe')->default(false);
        });
    }

    public function down(): void
    {
        Schema::table('project_media', fn (Blueprint $table) => $table->dropColumn('public_safe'));
    }
};
