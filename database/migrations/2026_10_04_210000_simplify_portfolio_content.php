<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (DB::table('projects')->get() as $project) {
            $description = json_decode($project->description ?? '{}', true) ?? [];
            $sections = json_decode($project->sections ?? '[]', true) ?? [];
            if ($project->content_key === 'the-agency-drc') {
                $sections = array_filter($sections, fn ($s) => ($s['title']['fr'] ?? '') !== 'Une référence actuelle');
                DB::table('projects')->where('id', $project->id)->update(['context' => json_encode(['fr' => 'The Agency DRC est un projet immobilier associé à Axum Industries. Le site présente une recherche de biens à vendre ou à louer, avec des filtres de commune et de prix.', 'en' => 'The Agency DRC is a real estate project associated with Axum Industries. The website presents properties for sale or rent, with municipality and price filters.'], JSON_UNESCAPED_UNICODE)]);
            }
            foreach (['fr', 'en'] as $locale) {
                foreach ($sections as $section) {
                    $description[$locale] = trim(($description[$locale] ?? '')."\n\n## ".($section['title'][$locale] ?? '')."\n\n".($section['body'][$locale] ?? ''));
                }
            }
            DB::table('projects')->where('id', $project->id)->update(['description' => json_encode($description, JSON_UNESCAPED_UNICODE)]);
        }
        Schema::table('projects', fn (Blueprint $t) => $t->dropColumn(['technologies', 'sections', 'project_status', 'category', 'repository_url']));
        Schema::table('activities', function (Blueprint $t) {
            $t->renameColumn('excerpt', 'summary');
            $t->renameColumn('started_at', 'event_date');
            $t->dropColumn(['ended_at', 'seo_title', 'seo_description']);
        });
        $types = DB::table('activities')->pluck('type', 'id');
        Schema::table('activities', fn (Blueprint $t) => $t->dropColumn('type'));
        Schema::table('activities', fn (Blueprint $t) => $t->string('type')->default('other'));
        foreach ($types as $id => $type) {
            $value = json_decode($type ?? '{}', true);
            DB::table('activities')->where('id', $id)->update(['type' => is_array($value) ? ($value['fr'] ?? 'other') : ($type ?: 'other')]);
        }
        Schema::table('publications', fn (Blueprint $t) => $t->dropColumn(['description', 'tags', 'reading_time']));
        foreach (['project_media', 'activity_media'] as $name) {
            DB::table($name)->where('type', 'screenshot')->update(['type' => 'desktop']);
            DB::table($name)->where('type', 'diagram')->update(['type' => 'other']);
            Schema::table($name, fn (Blueprint $t) => $t->dropColumn('caption'));
        }
        Schema::table('skills', fn (Blueprint $t) => $t->boolean('visible')->default(true));
        DB::table('site_settings')->whereIn('key', ['hero_title', 'journeyNotes', 'navigationName', 'location_short'])->delete();
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $t) {
            $t->jsonb('technologies')->nullable();
            $t->jsonb('sections')->nullable();
            $t->jsonb('project_status')->nullable();
            $t->string('category')->default('Web');
            $t->string('repository_url', 2048)->nullable();
        });
        Schema::table('activities', function (Blueprint $t) {
            $t->renameColumn('summary', 'excerpt');
            $t->renameColumn('event_date', 'started_at');
            $t->date('ended_at')->nullable();
            $t->jsonb('seo_title')->nullable();
            $t->jsonb('seo_description')->nullable();
        });
        $types = DB::table('activities')->pluck('type', 'id');
        Schema::table('activities', fn (Blueprint $t) => $t->dropColumn('type'));
        Schema::table('activities', fn (Blueprint $t) => $t->jsonb('type')->nullable());
        foreach ($types as $id => $type) {
            DB::table('activities')->where('id', $id)->update(['type' => json_encode(['fr' => $type, 'en' => $type])]);
        }
        Schema::table('publications', function (Blueprint $t) {
            $t->jsonb('description')->nullable();
            $t->jsonb('tags')->nullable();
            $t->unsignedInteger('reading_time')->default(1);
        });
        foreach (['project_media', 'activity_media'] as $name) {
            Schema::table($name, fn (Blueprint $t) => $t->jsonb('caption')->nullable());
        }
        Schema::table('skills', fn (Blueprint $t) => $t->dropColumn('visible'));
        // Prose stays in descriptions; retired metadata cannot be reconstructed on rollback.
    }
};
