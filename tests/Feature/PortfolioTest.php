<?php

namespace Tests\Feature;

use App\Mail\ContactMessageReceived;
use App\Models\Activity;
use App\Models\Certification;
use App\Models\ContactMessage;
use App\Models\Education;
use App\Models\Experience;
use App\Models\PageView;
use App\Models\Project;
use App\Models\Publication;
use App\Models\SiteSetting;
use App\Models\Skill;
use App\Models\SkillCategory;
use App\Models\SocialLink;
use App\Models\User;
use App\Services\PortfolioData;
use Database\Seeders\PortfolioContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PortfolioTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        config(['inertia.ssr.enabled' => false, 'portfolio.admin_email' => 'admin@example.test', 'portfolio.send_confirmation' => false]);
        Storage::fake('public');
        $this->seed(PortfolioContentSeeder::class);
    }

    private function admin(): User
    {
        $user = User::factory()->create();
        $user->forceFill(['is_admin' => true])->save();

        return $user;
    }

    private function payload(string $type = 'projects'): array
    {
        $data = ['title' => ['fr' => 'Projet test', 'en' => 'Test project'], 'slug' => ['fr' => 'test-fr', 'en' => 'test-en'],
            'excerpt' => ['fr' => 'Résumé', 'en' => 'Summary'], 'description' => ['fr' => 'Description', 'en' => 'Description'],
            'status' => 'draft', 'sort_order' => 5, 'published_at' => null];

        return $data + match ($type) {
            'projects' => ['featured' => false, 'confidential' => false],
            'activities' => ['type' => 'Workshop', 'summary' => ['fr' => 'Résumé', 'en' => 'Summary'], 'role' => ['fr' => 'Test', 'en' => 'Test'], 'location' => ['fr' => 'Test', 'en' => 'Test'], 'event_date' => '2026-01-01'],
            'publications' => ['body' => ['fr' => '# Titre\nTexte', 'en' => '# Title\nText']],
        };
    }

    public function test_homepages_and_public_indexes(): void
    {
        foreach (['/' => 'fr', '/en' => 'en', '/projets' => 'fr', '/en/projects' => 'en', '/a-propos' => 'fr', '/en/about' => 'en', '/activites' => 'fr', '/publications' => 'fr', '/contact' => 'fr'] as $url => $locale) {
            $this->get($url)->assertOk()->assertInertia(fn (Assert $p) => $p->where('locale', $locale)->where('portfolio.name', 'Espoir Mulela Mastolo'));
        }
        $this->assertDatabaseCount('projects', 9);
        $this->assertDatabaseCount('activities', 0);
        $this->assertDatabaseCount('publications', 0);
    }

    public function test_every_real_project_in_both_languages_and_content_parity(): void
    {
        $source = json_decode(file_get_contents(database_path('seeders/data/portfolio.json')), true);
        foreach ($source['projects'] as $original) {
            $p = Project::where('content_key', $original['id'])->firstOrFail();
            $this->assertEquals($original['title'], $p->title);
            $this->assertEquals($original['description'], $p->description);
            foreach (['fr', 'en'] as $l) {
                $this->get(route('public.'.$l.'.projects.show', ['slug' => $p->translated('slug', $l)]))->assertOk()->assertInertia(fn (Assert $page) => $page->component('public/project-show')->where('project.title', $p->title));
            }
        }
        $this->assertDatabaseCount('experiences', 4);
        $this->assertDatabaseCount('education', 3);
        $this->assertDatabaseCount('certifications', 2);
        $this->assertDatabaseCount('project_media', 14);
    }

    public function test_locale_switch_resolves_translated_slug(): void
    {
        $p = Project::first();
        $p->update(['slug' => ['fr' => 'version-francaise', 'en' => 'english-version']]);
        $this->get('/projets/version-francaise')->assertInertia(fn (Assert $page) => $page->where('meta.switchUrl', '/en/projects/english-version'));
        $this->get('/en/projects/english-version')->assertInertia(fn (Assert $page) => $page->where('meta.switchUrl', '/projets/version-francaise'));
    }

    public function test_guests_non_admins_and_registration(): void
    {
        $this->get('/admin')->assertRedirect('/login');
        $this->get('/register')->assertNotFound();
        $this->post('/register', [])->assertNotFound();
        $this->actingAs(User::factory()->create())->get('/admin')->assertForbidden();
        $this->post('/admin/projects', $this->payload())->assertForbidden();
    }

    public function test_login_and_logout_use_standard_sessions(): void
    {
        $user = $this->admin();
        $user->update(['password' => 'A-test-password-123']);
        $this->post('/login', ['email' => $user->email, 'password' => 'A-test-password-123'])->assertRedirect('/admin');
        $this->assertAuthenticatedAs($user);
        $this->post('/logout')->assertRedirect('/');
        $this->assertGuest();
    }

    public function test_project_activity_and_publication_crud(): void
    {
        $this->actingAs($this->admin());
        foreach (['projects' => Project::class, 'activities' => Activity::class, 'publications' => Publication::class] as $type => $model) {
            $data = $this->payload($type);
            $this->post('/admin/'.$type, $data)->assertSessionHasNoErrors()->assertRedirect();
            $item = $model::where('slug->fr', 'test-fr')->firstOrFail();
            $this->get('/admin/'.$type.'/'.$item->id.'/edit')->assertOk();
            $this->get('/admin/'.$type.'/'.$item->id.'/preview')->assertOk()->assertInertia(fn (Assert $page) => $page->where('preview', true)->where('meta.robots', 'noindex, follow'));
            $data['title']['fr'] = 'Modification';
            $data['status'] = 'published';
            $this->put('/admin/'.$type.'/'.$item->id, $data)->assertSessionHasNoErrors();
            $this->assertSame('Modification', $item->fresh()->title['fr']);
            $segment = ['projects' => 'projets', 'activities' => 'activites', 'publications' => 'publications'][$type];
            $this->get('/'.$segment.'/test-fr')->assertOk();
            $this->delete('/admin/'.$type.'/'.$item->id)->assertRedirect();
            $this->assertSoftDeleted($item);
            $this->get('/'.$segment.'/test-fr')->assertNotFound();
        }
    }

    public function test_drafts_archives_future_content_and_preview_are_private(): void
    {
        $this->actingAs($this->admin())->post('/admin/projects', $this->payload())->assertSessionHasNoErrors();
        $p = Project::where('slug->fr', 'test-fr')->first();
        $this->get('/projets/test-fr')->assertNotFound();
        $this->get('/sitemap.xml')->assertDontSee('test-fr');
        $this->actingAs($this->admin())->get('/admin/projects/'.$p->id.'/preview')->assertOk();
        auth()->logout();
        $this->get('/admin/projects/'.$p->id.'/preview')->assertRedirect('/login');
        $p->update(['status' => 'published', 'published_at' => now()->addDay()]);
        $this->get('/projets/test-fr')->assertNotFound();
        $p->update(['published_at' => now()->subDay()]);
        $this->get('/projets/test-fr')->assertOk();
        $p->update(['status' => 'archived']);
        $this->get('/projets/test-fr')->assertNotFound();
    }

    public function test_slug_uniqueness_and_bilingual_validation(): void
    {
        $this->actingAs($this->admin());
        $data = $this->payload();
        $data['slug']['fr'] = Project::first()->slug['fr'];
        $this->post('/admin/projects', $data)->assertSessionHasErrors('slug.fr');
        $data['title']['en'] = '';
        $this->post('/admin/projects', $data)->assertSessionHasErrors('title.en');
    }

    public function test_contact_validation_persistence_and_notification(): void
    {
        Mail::fake();
        $this->from('/contact')->post('/contact', [])->assertSessionHasErrors(['name', 'email', 'subject', 'message']);
        $data = ['name' => 'Visiteur test', 'email' => 'visitor@example.test', 'subject' => 'Conversation', 'message' => 'Un message de test assez long pour la validation.', 'website' => ''];
        $this->post('/contact', $data)->assertRedirect('/contact')->assertSessionHas('success');
        $this->assertDatabaseHas('contact_messages', ['email' => 'visitor@example.test']);
        Mail::assertSent(ContactMessageReceived::class, fn ($mail) => $mail->hasTo('admin@example.test') && $mail->contact->subject === 'Conversation');
    }

    public function test_contact_honeypot_and_throttle(): void
    {
        Mail::fake();
        $data = ['name' => 'Robot', 'email' => 'bot@example.test', 'subject' => 'Test', 'message' => 'Message de test avec honeypot rempli.', 'website' => 'bot.test'];
        $this->post('/contact', $data)->assertRedirect();
        $this->assertDatabaseCount('contact_messages', 0);
        Mail::assertNothingSent();
        for ($i = 0; $i < 2; $i++) {
            $this->post('/contact', $data)->assertRedirect();
        }
        $this->post('/contact', $data)->assertStatus(429);
    }

    public function test_analytics_counts_visitors_without_raw_ip_and_ignores_admin_bots(): void
    {
        $this->get('/');
        $this->get('/projets/culinapos');
        $this->assertDatabaseCount('page_views', 2);
        $this->assertSame(1, PageView::distinct()->count('visitor_hash'));
        $this->assertDatabaseHas('page_views', ['viewable_type' => 'projects', 'viewable_id' => Project::where('content_key', 'culinapos')->value('id')]);
        $this->withHeader('User-Agent', 'Googlebot')->get('/');
        $this->assertDatabaseCount('page_views', 2);
        $this->withHeader('User-Agent', 'Browser')->actingAs($this->admin())->get('/');
        $this->assertDatabaseCount('page_views', 2);
        $this->assertFalse(Schema::hasColumn('page_views', 'ip'));
    }

    public function test_unused_social_events_route_is_removed(): void
    {
        $this->post('/events', [])->assertNotFound();
        $this->assertFalse(Schema::hasTable('analytics_events'));
    }

    public function test_seo_server_metadata_and_sitemap(): void
    {
        config(['portfolio.indexable' => true]);
        $this->get('/projets/libiki-lya-kongo')->assertSee('rel="canonical"', false)->assertSee('hreflang="en"', false)->assertSee('application/ld+json', false)->assertSee('og:title', false);
        $this->get('/sitemap.xml')->assertOk()->assertSee('/projets/libiki-lya-kongo')->assertSee('/en/projects/libiki-lya-kongo')->assertDontSee('/admin');
        $this->get('/robots.txt')->assertSee('Disallow: /admin');
    }

    public function test_confidential_project_only_serializes_audited_snapshot_and_no_links(): void
    {
        $p = Project::where('confidential', true)->firstOrFail();
        $p->update(['external_url' => 'https://private.example.test']);
        $p->media()->create(['path' => 'private-unapproved.png', 'alt' => ['fr' => 'Privé', 'en' => 'Private'], 'type' => 'desktop', 'width' => 200, 'height' => 200, 'sort_order' => 99]);
        $this->get('/projets/'.$p->slug['fr'])->assertInertia(fn (Assert $page) => $page->has('project.media', 1)->where('project.media.0.src', '/storage/images/projects/fomin/fomin-dashboard.png')->where('project.links', []))->assertDontSee('private.example.test')->assertDontSee('private-unapproved.png');
        $this->actingAs($this->admin())->post('/admin/media', ['owner_type' => 'project', 'owner_id' => $p->id, 'type' => 'desktop', 'sort_order' => 0, 'alt' => ['fr' => 'Image', 'en' => 'Image'], 'file' => UploadedFile::fake()->image('test.jpg', 200, 200)])->assertSessionHasErrors('owner_id');
    }

    public function test_upload_alt_order_and_safe_deletion(): void
    {
        $this->actingAs($this->admin());
        $p = Project::where('confidential', false)->first();
        $this->post('/admin/media', ['owner_type' => 'project', 'owner_id' => $p->id, 'type' => 'cover', 'sort_order' => 0, 'alt' => ['fr' => 'Aperçu', 'en' => 'Preview'], 'file' => UploadedFile::fake()->image('../../evil.jpg', 400, 400)])->assertSessionHasNoErrors();
        $media = $p->media()->reorder()->latest('id')->first();
        $this->assertStringStartsWith('uploads/project/', $media->path);
        Storage::disk('public')->assertExists($media->path);
        $this->put('/admin/media/project/'.$media->id, ['alt' => ['fr' => 'Modifié', 'en' => 'Updated'], 'sort_order' => 1, 'type' => 'cover'])->assertSessionHasNoErrors();
        $this->delete('/admin/media/project/'.$media->id)->assertSessionHas('error');
        $this->assertModelExists($media);
        $p->update(['status' => 'draft']);
        $this->delete('/admin/media/project/'.$media->id)->assertSessionHas('success');
        Storage::disk('public')->assertMissing($media->path);
    }

    public function test_upload_rejects_svg_and_invalid_owner(): void
    {
        $this->actingAs($this->admin());
        $this->post('/admin/media', ['owner_type' => 'project', 'owner_id' => 1, 'type' => 'desktop', 'sort_order' => 0, 'alt' => ['fr' => 'Test', 'en' => 'Test'], 'file' => UploadedFile::fake()->create('payload.svg', 2, 'image/svg+xml')])->assertSessionHasErrors('file');
    }

    public function test_markdown_strips_html_and_unsafe_links(): void
    {
        $html = app(PortfolioData::class)->markdown('<script>alert(1)</script>\n[click](javascript:alert(1))\n# Title');
        $this->assertStringNotContainsString('<script', $html);
        $this->assertStringNotContainsString('href="javascript:', $html);
    }

    public function test_messages_and_settings_admin_modules(): void
    {
        $this->actingAs($this->admin());
        $message = ContactMessage::create(['name' => 'Test', 'email' => 'test@example.test', 'subject' => 'Message', 'message' => 'Texte']);
        $this->get('/admin/messages/'.$message->id)->assertOk();
        $this->assertNotNull($message->fresh()->read_at);
        $this->patch('/admin/messages/'.$message->id, ['action' => 'archive'])->assertSessionHasNoErrors();
        $this->assertNotNull($message->fresh()->archived_at);
        $settings = SiteSetting::pluck('value', 'key')->all();
        $settings['name'] = 'Espoir Mulela Mastolo';
        $this->put('/admin/settings', $settings)->assertSessionHasNoErrors();
        foreach (['/admin', '/admin/settings', '/admin/media', '/admin/messages', '/admin/experiences', '/admin/education', '/admin/certifications', '/admin/skills', '/admin/skill-categories', '/admin/social-links'] as $url) {
            $this->get($url)->assertOk();
        }
    }

    public function test_seed_does_not_overwrite_admin_edits(): void
    {
        $p = Project::first();
        $p->update(['title' => ['fr' => 'Modification conservée', 'en' => 'Saved edit']]);
        $this->seed(PortfolioContentSeeder::class);
        $this->assertSame('Modification conservée', $p->fresh()->title['fr']);
        $this->assertDatabaseCount('projects', 9);
    }

    public function test_journey_and_social_records_can_be_created_edited_and_deleted(): void
    {
        $this->actingAs($this->admin());
        $translated = ['fr' => 'Texte de test', 'en' => 'Test text'];
        $common = ['organization' => 'Organisation de test', 'description' => $translated, 'sort_order' => 90];
        $records = [
            'experiences' => [$common + ['role' => $translated, 'period' => '2026', 'started_at' => null, 'ended_at' => null, 'current' => false, 'contributions' => []], Experience::class],
            'education' => [$common + ['title' => $translated, 'period' => '2026', 'started_at' => null, 'ended_at' => null, 'current' => false], Education::class],
            'certifications' => [$common + ['title' => $translated], Certification::class],
            'skill-categories' => [['title' => $translated, 'description' => $translated, 'sort_order' => 90], SkillCategory::class],
            'skills' => [['name' => 'Test skill', 'visible' => true, 'skill_category_id' => SkillCategory::first()->id, 'sort_order' => 90], Skill::class],
            'social-links' => [['platform' => 'GitHub', 'url' => 'https://github.com/test-account', 'enabled' => false, 'sort_order' => 90], SocialLink::class],
        ];
        foreach ($records as $module => [$data, $model]) {
            $before = $model::count();
            $this->post('/admin/'.$module, $data)->assertSessionHasNoErrors()->assertRedirect('/admin/'.$module);
            $this->assertSame($before + 1, $model::count());
            $item = $model::orderByDesc('id')->first();
            $data['sort_order'] = 91;
            $this->put('/admin/'.$module.'/'.$item->id, $data)->assertSessionHasNoErrors();
            $this->assertSame(91, $item->fresh()->sort_order);
            $this->delete('/admin/'.$module.'/'.$item->id)->assertSessionHas('success');
            $this->assertSame($before, $model::count());
        }
    }

    public function test_original_asset_hashes_are_preserved(): void
    {
        $fixture = json_decode(file_get_contents(base_path('tests/fixtures/parity.json')), true);
        foreach ($fixture['assets'] as $asset) {
            $this->assertSame($asset['sha256'], hash_file('sha256', public_path('images/'.$asset['path'])));
        }
    }
}
