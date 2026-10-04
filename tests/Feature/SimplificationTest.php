<?php

namespace Tests\Feature;

use App\Models\ContactMessage;
use App\Models\Education;
use App\Models\Experience;
use App\Models\Project;
use App\Models\SiteSetting;
use App\Models\Skill;
use App\Models\SkillCategory;
use App\Models\User;
use App\Services\PortfolioData;
use Database\Seeders\PortfolioContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SimplificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        config(['inertia.ssr.enabled' => false]);
        Storage::fake('public');
        $this->seed(PortfolioContentSeeder::class);
        $user = User::factory()->create(['is_admin' => true]);
        $this->actingAs($user);
    }

    public function test_overview_contains_only_useful_statistics_and_analytics_route_is_removed(): void
    {
        $this->get('/admin')->assertOk()->assertInertia(fn (Assert $p) => $p->has('stats.visitors.1')->has('stats.visitors.7')->has('stats.visitors.30')->where('stats.projects', 9)->has('pages')->has('topProjects')->has('messages')->missing('stats.views')->missing('sources')->missing('events')->missing('locales')->missing('topPublications'));
        $this->get('/admin/analytics')->assertNotFound();
        $this->post('/events', [])->assertNotFound();
        $this->assertFalse(Schema::hasTable('analytics_events'));
        foreach (['locale', 'referrer_domain', 'route_name', 'ip'] as $field) {
            $this->assertFalse(Schema::hasColumn('page_views', $field));
        }
        foreach (['label', 'icon'] as $field) {
            $this->assertFalse(Schema::hasColumn('social_links', $field));
        }
    }

    public function test_archive_and_delete_message_keep_public_state_consistent(): void
    {
        $project = Project::first();
        $this->patch('/admin/projects/'.$project->id.'/archive')->assertSessionHas('success');
        $this->assertSame('archived', $project->fresh()->status);
        $this->get('/projets/'.$project->slug['fr'])->assertNotFound();
        $this->get('/sitemap.xml')->assertDontSee('/projets/'.$project->slug['fr'].'<');
        $message = ContactMessage::create(['name' => 'Disposable test', 'email' => 'test@example.test', 'subject' => 'Test', 'message' => 'Test text']);
        $this->get('/admin')->assertInertia(fn (Assert $p) => $p->where('stats.unread', 1));
        $this->get('/admin/messages/'.$message->id)->assertOk();
        $this->get('/admin')->assertInertia(fn (Assert $p) => $p->where('stats.unread', 0));
        $this->patch('/admin/messages/'.$message->id, ['action' => 'archive'])->assertSessionHasNoErrors();
        $this->delete('/admin/messages/'.$message->id)->assertRedirect('/admin/messages');
        $this->assertSoftDeleted($message);
        $this->get('/admin/messages/'.$message->id)->assertNotFound();
    }

    public function test_settings_and_journey_automatically_feed_public_content(): void
    {
        $settings = SiteSetting::pluck('value', 'key')->all();
        $settings['introduction'] = ['fr' => 'Présentation modifiée.', 'en' => 'Updated introduction.'];
        $this->put('/admin/settings', $settings)->assertSessionHasNoErrors();
        Education::where('current', true)->update(['title' => ['fr' => 'Formation modifiée', 'en' => 'Updated education']]);
        Experience::first()->update(['role' => ['fr' => 'Rôle modifié', 'en' => 'Updated role']]);
        $this->get('/')->assertInertia(fn (Assert $p) => $p->where('portfolio.introduction.fr', 'Présentation modifiée.')->where('portfolio.journeyNotes.0.title.fr', 'Formation modifiée')->where('portfolio.journeyNotes.1.title.fr', 'Rôle modifié'));
        $this->get('/en')->assertInertia(fn (Assert $p) => $p->where('portfolio.introduction.en', 'Updated introduction.'));
        foreach (['hero_title', 'journeyNotes', 'navigationName', 'location_short'] as $field) {
            $this->assertDatabaseMissing('site_settings', ['key' => $field]);
        }
        $this->get('/admin/settings')->assertInertia(fn (Assert $p) => $p->missing('settings.hero_title')->missing('settings.journeyNotes')->has('settings.professional_title'));
    }

    public function test_hidden_skills_are_excluded_from_the_public_journey(): void
    {
        $skill = Skill::create(['name' => 'Invisible test skill', 'skill_category_id' => SkillCategory::first()->id, 'visible' => false, 'sort_order' => 99]);
        $this->get('/a-propos')->assertDontSee('Invisible test skill');
        $skill->update(['visible' => true]);
        $this->get('/a-propos')->assertSee('Invisible test skill');
    }

    public function test_project_prose_and_agency_media_survive_the_simplification(): void
    {
        foreach (['technologies', 'sections', 'category', 'project_status', 'repository_url'] as $column) {
            $this->assertFalse(Schema::hasColumn('projects', $column));
        }
        $project = Project::where('content_key', 'the-agency-drc')->firstOrFail();
        $dto = app(PortfolioData::class)->project($project);
        $this->assertStringNotContainsString('Une référence actuelle', $dto['description']['fr']);
        $this->assertStringNotContainsString('domaine temporaire', $dto['description']['fr']);
        $this->assertCount(2, $dto['media']);
        $this->assertSame('https://theagency.axumindustries.com/', $dto['links'][0]['url']);
        $this->assertArrayNotHasKey('technologies', $dto);
        $this->assertStringContainsString('<h2>', $dto['html']['fr']);
    }

    public function test_migration_preserves_existing_sections_in_both_languages(): void
    {
        $migration = require database_path('migrations/2026_10_04_210000_simplify_portfolio_content.php');
        $migration->down();
        $project = Project::first();
        DB::table('projects')->where('id', $project->id)->update(['description' => json_encode(['fr' => 'Texte initial', 'en' => 'Original text']), 'sections' => json_encode([['title' => ['fr' => 'Solution', 'en' => 'Solution'], 'body' => ['fr' => 'Texte réel conservé', 'en' => 'Preserved real text']]])]);
        $migration->up();
        $this->assertSame("Texte initial\n\n## Solution\n\nTexte réel conservé", $project->fresh()->description['fr']);
        $this->assertSame("Original text\n\n## Solution\n\nPreserved real text", $project->fresh()->description['en']);
        $this->assertDatabaseCount('projects', 9);
        $this->assertDatabaseCount('project_media', 14);
    }
}
