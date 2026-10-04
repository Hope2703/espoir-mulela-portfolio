<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('analytics_events');
        $columns = array_values(array_filter(['route_name', 'locale', 'referrer_domain'], fn ($column) => Schema::hasColumn('page_views', $column)));
        if ($columns) {
            Schema::table('page_views', fn (Blueprint $t) => $t->dropColumn($columns));
        }
    }

    public function down(): void
    {
        Schema::table('page_views', function (Blueprint $t) {
            $t->string('route_name')->nullable();
            $t->string('locale', 2)->default('fr');
            $t->string('referrer_domain')->nullable();
        });
        Schema::create('analytics_events', function (Blueprint $t) {
            $t->id();
            $t->string('visitor_hash', 64);
            $t->string('event_type');
            $t->string('locale', 2);
            $t->timestamp('created_at')->index();
            $t->index(['event_type', 'created_at']);
        });
    }
};
