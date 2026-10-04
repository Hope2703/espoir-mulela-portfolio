<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', fn (Blueprint $t) => $t->boolean('is_admin')->default(false));
        foreach (['projects', 'activities', 'publications'] as $table) {
            Schema::create($table, function (Blueprint $t) use ($table) {
                $t->id();
                $t->jsonb('title');
                $t->jsonb('slug');
                $t->jsonb('excerpt')->nullable();
                $t->jsonb('description')->nullable();
                $t->jsonb('seo_title')->nullable();
                $t->jsonb('seo_description')->nullable();
                $t->string('status')->default('draft')->index();
                $t->timestamp('published_at')->nullable()->index();
                $t->unsignedInteger('sort_order')->default(0)->index();
                if ($table === 'projects') {
                    $t->string('content_key')->nullable()->unique();
                    $t->jsonb('context')->nullable();
                    $t->jsonb('role')->nullable();
                    $t->string('category');
                    $t->boolean('featured')->default(false)->index();
                    $t->boolean('confidential')->default(false);
                    $t->string('external_url', 2048)->nullable();
                    $t->string('repository_url', 2048)->nullable();
                    $t->jsonb('technologies')->nullable();
                    $t->jsonb('sections')->nullable();
                    $t->jsonb('project_status')->nullable();
                } elseif ($table === 'activities') {
                    $t->jsonb('type')->nullable();
                    $t->jsonb('role')->nullable();
                    $t->jsonb('location')->nullable();
                    $t->date('started_at')->nullable();
                    $t->date('ended_at')->nullable();
                    $t->string('external_url', 2048)->nullable();
                } else {
                    $t->jsonb('body')->nullable();
                    $t->string('cover')->nullable();
                    $t->jsonb('tags')->nullable();
                    $t->unsignedInteger('reading_time')->default(1);
                }
                $t->timestamps();
                $t->softDeletes();
            });
            // Database uniqueness complements FormRequest validation, including archived/soft-deleted content.
            foreach (['fr', 'en'] as $locale) {
                $expression = DB::getDriverName() === 'pgsql' ? "(slug->>'$locale')" : "(json_extract(slug, '$.$locale'))";
                DB::statement("CREATE UNIQUE INDEX {$table}_slug_{$locale}_unique ON {$table} ({$expression})");
            }
        }
        foreach (['project' => 'projects', 'activity' => 'activities'] as $name => $parent) {
            Schema::create($name.'_media', function (Blueprint $t) use ($name, $parent) {
                $t->id();
                $t->foreignId($name.'_id')->constrained($parent)->cascadeOnDelete();
                $t->string('type')->default('screenshot');
                $t->string('path');
                $t->jsonb('alt');
                $t->jsonb('caption')->nullable();
                $t->unsignedInteger('width');
                $t->unsignedInteger('height');
                $t->unsignedInteger('sort_order')->default(0);
                $t->timestamps();
            });
        }
        foreach (['experiences', 'education', 'certifications', 'skill_categories'] as $table) {
            Schema::create($table, function (Blueprint $t) use ($table) {
                $t->id();
                $t->string('organization')->nullable();
                $t->jsonb('title')->nullable();
                $t->jsonb('description')->nullable();
                $t->unsignedInteger('sort_order')->default(0)->index();
                if ($table === 'experiences') {
                    $t->jsonb('role');
                    $t->jsonb('contributions')->nullable();
                }
                if (in_array($table, ['experiences', 'education'])) {
                    $t->string('period')->nullable();
                    $t->date('started_at')->nullable();
                    $t->date('ended_at')->nullable();
                    $t->boolean('current')->default(false);
                }
                $t->timestamps();
            });
        }
        Schema::create('skills', function (Blueprint $t) {
            $t->id();
            $t->foreignId('skill_category_id')->constrained()->cascadeOnDelete();
            $t->string('name');
            $t->unsignedInteger('sort_order')->default(0);
            $t->timestamps();
        });
        Schema::create('social_links', function (Blueprint $t) {
            $t->id();
            $t->string('platform')->unique();
            $t->string('label');
            $t->string('url', 2048);
            $t->string('icon')->nullable();
            $t->unsignedInteger('sort_order')->default(0);
            $t->boolean('enabled')->default(true);
            $t->timestamps();
        });
        Schema::create('site_settings', function (Blueprint $t) {
            $t->id();
            $t->string('key')->unique();
            $t->jsonb('value');
            $t->timestamps();
        });
        Schema::create('contact_messages', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('email');
            $t->string('subject');
            $t->text('message');
            $t->timestamp('read_at')->nullable()->index();
            $t->timestamp('archived_at')->nullable()->index();
            $t->timestamps();
            $t->softDeletes();
        });
        Schema::create('page_views', function (Blueprint $t) {
            $t->id();
            $t->string('visitor_hash', 64)->index();
            $t->string('path', 2048);
            $t->string('route_name');
            $t->string('locale', 2);
            $t->string('viewable_type')->nullable();
            $t->unsignedBigInteger('viewable_id')->nullable();
            $t->string('referrer_domain')->nullable();
            $t->timestamp('created_at')->index();
            $t->index(['viewable_type', 'viewable_id']);
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

    public function down(): void
    {
        foreach (['analytics_events', 'page_views', 'contact_messages', 'site_settings', 'social_links', 'skills', 'skill_categories', 'certifications', 'education', 'experiences', 'activity_media', 'project_media', 'publications', 'activities', 'projects'] as $table) {
            Schema::dropIfExists($table);
        }
        Schema::table('users', fn (Blueprint $t) => $t->dropColumn('is_admin'));
    }
};
