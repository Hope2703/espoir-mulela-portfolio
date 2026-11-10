<?php

namespace Tests\Feature;

use App\Models\Activity;
use App\Models\Experience;
use App\Models\Project;
use App\Models\User;
use App\Services\PortfolioData;
use Database\Seeders\PortfolioContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ContentPrivacyTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        config(['inertia.ssr.enabled' => false]);
        Storage::fake('public');
        $this->seed(PortfolioContentSeeder::class);
    }

    public function test_confidential_fields_never_reach_public_html_inertia_or_metadata_in_either_language(): void
    {
        $project = Project::where('confidential', true)->firstOrFail();
        $fields = [];
        foreach (['title', 'excerpt', 'description', 'context', 'role', 'seo_title', 'seo_description'] as $field) {
            $fields[$field] = ['fr' => 'PRIVATE-'.$field.'-FR', 'en' => 'PRIVATE-'.$field.'-EN'];
        }
        $project->update($fields + ['content_key' => 'PRIVATE-CONTENT-KEY', 'confidential' => false, 'external_url' => 'https://private-project.example.test']);
        $project->media()->create(['path' => 'PRIVATE-MEDIA.png', 'alt' => ['fr' => 'PRIVATE-ALT-FR', 'en' => 'PRIVATE-ALT-EN'], 'public_safe' => true, 'type' => 'cover', 'width' => 200, 'height' => 200, 'sort_order' => 0]);
        $before = $project->fresh()->getAttributes();

        foreach (['fr' => ['', 'projets'], 'en' => ['/en', 'projects']] as $locale => [$prefix, $segment]) {
            $detail = $prefix.'/'.$segment.'/'.$project->slug[$locale];
            foreach ([$prefix ?: '/', $prefix.'/'.$segment, $detail, $prefix.($locale === 'fr' ? '/a-propos' : '/about')] as $url) {
                $this->get($url)->assertOk()->assertDontSee('PRIVATE-')->assertDontSee('private-project.example.test')->assertDontSee('fomin', false)->assertDontSee('redevance', false)->assertDontSee('mining royalty', false);
                $response = $this->withHeaders(['X-Inertia' => 'true', 'X-Inertia-Version' => Inertia::getVersion(), 'X-Requested-With' => 'XMLHttpRequest'])->get($url);
                $response->assertOk()->assertHeader('X-Inertia', 'true')->assertDontSee('PRIVATE-')->assertDontSee('private-project.example.test')->assertDontSee('fomin', false);
                $this->flushHeaders();
            }
            $this->get($detail)->assertInertia(fn (Assert $page) => $page
                ->where('project.media', [])->where('project.links', [])->where('project.role', null)
                ->where('project.title.'.$locale, __('confidential.institutional_project.title', [], $locale))
                ->where('project.shortDescription.'.$locale, __('confidential.institutional_project.subtitle', [], $locale))
                ->where('project.description.'.$locale, __('confidential.institutional_project.description', [], $locale))
                ->where('meta.description', __('confidential.institutional_project.description', [], $locale))
                ->where('meta.jsonLd.@graph.2.itemListElement.2.name', __('confidential.institutional_project.title', [], $locale))
                ->where('meta.switchUrl', $locale === 'fr' ? '/en/projects/'.$project->slug['en'] : '/projets/'.$project->slug['fr']));
        }
        $this->assertSame($before, $project->fresh()->getAttributes());
        $this->assertDatabaseHas('project_media', ['path' => 'PRIVATE-MEDIA.png', 'public_safe' => true]);
    }

    public function test_institutional_project_cannot_be_made_public_from_the_editor(): void
    {
        $project = Project::where('content_key', Project::INSTITUTIONAL_KEY)->firstOrFail();
        $project->update(['confidential' => false]);
        $this->actingAs(User::factory()->create(['is_admin' => true]));
        $path = '/admin/projects/'.$project->id;

        $this->get($path.'/edit')->assertInertia(fn (Assert $page) => $page
            ->where('item.confidential', true)->where('item.confidentiality_locked', true));
        $this->put($path, $project->only('title', 'slug', 'excerpt', 'description', 'status', 'featured') + ['confidential' => false])
            ->assertSessionHasNoErrors();
        $this->assertTrue($project->fresh()->confidential);
    }

    public function test_legacy_taprinella_values_cannot_override_the_approved_public_copy(): void
    {
        $experience = Experience::where('organization', 'Taprinella Logistic SARL')->firstOrFail();
        $experience->update([
            'description' => ['fr' => 'PRIVATE-EXPERIENCE-FR', 'en' => 'PRIVATE-EXPERIENCE-EN'],
            'contributions' => [['fr' => 'PRIVATE-CONTRIBUTION-FR', 'en' => 'PRIVATE-CONTRIBUTION-EN']],
            'public_description' => ['fr' => 'PRIVATE-STALE-OVERRIDE-FR', 'en' => 'PRIVATE-STALE-OVERRIDE-EN'],
            'confidential' => false,
            'current' => true,
        ]);
        $before = $experience->fresh()->getAttributes();
        $approved = Experience::approvedTaprinellaResponsibilities();
        foreach (['/' => 'fr', '/en' => 'en', '/a-propos' => 'fr', '/en/about' => 'en'] as $url => $locale) {
            $this->get($url)->assertOk()->assertDontSee('PRIVATE-')->assertInertia(fn (Assert $page) => str_contains($url, 'about') || str_contains($url, 'a-propos')
                ? $page->where('experiences.2.role.'.$locale, $experience->role[$locale])->where('experiences.2.description.'.$locale, $approved[$locale])
                : $page->where('portfolio.journeyNotes.1.title.'.$locale, $experience->role[$locale])->where('portfolio.journeyNotes.1.description.'.$locale, $approved[$locale]));
            $this->withHeaders(['X-Inertia' => 'true', 'X-Inertia-Version' => Inertia::getVersion(), 'X-Requested-With' => 'XMLHttpRequest'])->get($url)
                ->assertOk()->assertHeader('X-Inertia', 'true')->assertDontSee('PRIVATE-');
            $this->flushHeaders();
        }
        $this->assertSame($before, $experience->fresh()->getAttributes());

        $experience->update(['confidential' => null, 'public_description' => null]);
        foreach (['/a-propos' => 'fr', '/en/about' => 'en'] as $url => $locale) {
            $this->get($url)->assertOk()->assertDontSee('PRIVATE-')->assertInertia(fn (Assert $page) => $page->where('experiences.2.organization', $experience->organization)->where('experiences.2.description.'.$locale, $approved[$locale]));
        }
    }

    public function test_confidential_experience_flag_works_for_other_organizations_and_all_shared_profile_pages(): void
    {
        $experience = Experience::firstOrFail();
        $experience->update(['confidential' => true, 'description' => ['fr' => 'PRIVATE-DETAILS-FR', 'en' => 'PRIVATE-DETAILS-EN'], 'contributions' => [['fr' => 'PRIVATE-LINE-FR', 'en' => 'PRIVATE-LINE-EN']]]);
        foreach (['/', '/en', '/contact', '/en/contact', '/a-propos', '/en/about'] as $url) {
            $this->get($url)->assertOk()->assertDontSee('PRIVATE-');
        }
        $experience->update(['confidential' => false]);
        $this->get('/a-propos')->assertSee('PRIVATE-DETAILS-FR')->assertSee('PRIVATE-LINE-FR');
    }

    public function test_admin_cannot_replace_taprinella_public_responsibilities_or_disable_privacy(): void
    {
        $experience = Experience::where('organization', 'Taprinella Logistic SARL')->firstOrFail();
        $experience->update(['confidential' => false, 'public_description' => ['fr' => 'PRIVATE-OLD-FR', 'en' => 'PRIVATE-OLD-EN']]);
        $this->get('/admin/experiences/'.$experience->id.'/edit')->assertRedirect('/login');
        $this->actingAs(User::factory()->create(['is_admin' => true]));
        $approved = Experience::approvedTaprinellaResponsibilities();
        $this->get('/admin/experiences/'.$experience->id.'/edit')->assertInertia(fn (Assert $page) => $page
            ->where('item.confidential', true)->where('item.description', $experience->description)
            ->where('item.public_description', $approved)->where('lockedFields', ['organization', 'confidential', 'public_description']));
        $private = $experience->only('organization', 'role', 'description', 'contributions', 'period', 'started_at', 'ended_at');
        $payload = ['organization' => 'Changed organization', 'confidential' => false, 'public_description' => ['fr' => 'PRIVATE-NEW-FR', 'en' => 'PRIVATE-NEW-EN']]
            + $private + $experience->only('current', 'sort_order');
        $this->put('/admin/experiences/'.$experience->id, $payload)->assertSessionHasNoErrors();
        $experience->refresh();
        $this->assertEquals($private, $experience->only(array_keys($private)));
        $this->assertTrue($experience->confidential);
        $this->assertEquals($approved, $experience->public_description);
    }

    public function test_other_experiences_keep_their_editable_bilingual_public_responsibilities(): void
    {
        $experience = Experience::firstOrFail();
        $this->actingAs(User::factory()->create(['is_admin' => true]));
        $payload = $experience->only('organization', 'role', 'description', 'contributions', 'period', 'started_at', 'ended_at', 'current', 'sort_order') + ['confidential' => true, 'public_description' => ['fr' => 'Responsabilites publiques.', 'en' => 'Public responsibilities.']];
        $this->put('/admin/experiences/'.$experience->id, $payload)->assertSessionHasNoErrors();
        $this->assertEquals($payload['public_description'], $experience->fresh()->public_description);
        $payload['public_description']['en'] = '';
        $this->put('/admin/experiences/'.$experience->id, $payload)->assertSessionHasErrors('public_description.en');
    }

    public function test_taprinella_correction_command_updates_only_public_privacy_fields_and_is_idempotent(): void
    {
        $experience = Experience::where('organization', 'Taprinella Logistic SARL')->firstOrFail();
        $other = Experience::firstOrFail();
        $experience->update([
            'description' => ['fr' => 'PRIVATE-DESCRIPTION-FR', 'en' => 'PRIVATE-DESCRIPTION-EN'],
            'contributions' => [['fr' => 'PRIVATE-CONTRIBUTIONS-FR', 'en' => 'PRIVATE-CONTRIBUTIONS-EN']],
            'period' => '2025', 'started_at' => '2025-01-01', 'ended_at' => '2025-10-01',
            'confidential' => false,
            'public_description' => ['fr' => 'PRIVATE-OVERRIDE-FR', 'en' => 'PRIVATE-OVERRIDE-EN'],
        ]);
        $otherBefore = $other->getAttributes();
        $changedFields = ['confidential', 'public_description', 'updated_at'];
        $unchanged = collect($experience->fresh()->getAttributes())->except($changedFields)->all();

        $this->artisan('portfolio:protect-taprinella')->assertSuccessful();

        $experience->refresh();
        $this->assertTrue($experience->confidential);
        $this->assertEquals(Experience::approvedTaprinellaResponsibilities(), $experience->public_description);
        $this->assertSame($unchanged, collect($experience->getAttributes())->except($changedFields)->all());
        $this->assertSame($otherBefore, $other->fresh()->getAttributes());
        // JSONB can return the locales in a different order than the catalogues.
        $experience->update(['public_description' => array_reverse(Experience::approvedTaprinellaResponsibilities(), true)]);
        $corrected = $experience->fresh()->getAttributes();

        $this->travel(1)->minute();
        $this->artisan('portfolio:protect-taprinella')->assertSuccessful();
        $this->assertSame($corrected, $experience->fresh()->getAttributes());
    }

    public function test_taprinella_correction_command_refuses_an_ambiguous_match(): void
    {
        $experience = Experience::where('organization', 'Taprinella Logistic SARL')->firstOrFail();
        $duplicate = $experience->replicate();
        $duplicate->organization = 'TAPRINELLA LOGISTICS';
        $duplicate->save();
        $before = Experience::orderBy('id')->get()->map->getAttributes()->all();

        $this->artisan('portfolio:protect-taprinella')->assertFailed();

        $this->assertSame($before, Experience::orderBy('id')->get()->map->getAttributes()->all());
    }

    public function test_confidential_media_direct_urls_are_denied_without_deleting_files(): void
    {
        $project = Project::where('confidential', true)->firstOrFail();
        $project->update(['confidential' => false]);
        Storage::disk('public')->put('images/projects/fomin/fomin-dashboard.png', 'PRIVATE-LEGACY-FILE');
        Storage::disk('public')->put('uploads/project/private-test.png', 'PRIVATE-FILE-CONTENTS');
        $project->media()->create(['path' => 'uploads/project/private-test.png', 'alt' => ['fr' => 'Privé', 'en' => 'Private'], 'public_safe' => true, 'type' => 'cover', 'width' => 200, 'height' => 200, 'sort_order' => 0]);
        foreach (['/storage/uploads/project/private-test.png', '/storage//uploads/project/private-test.png', '/storage/images/projects/fomin/fomin-dashboard.png', '/images/projects/fomin/fomin-dashboard.png', '/storage/IMAGES/PROJECTS/FOMIN/fomin-dashboard.png'] as $url) {
            $this->get($url)->assertNotFound()->assertDontSee('PRIVATE-FILE-CONTENTS');
            $this->head($url)->assertNotFound();
        }
        $project->delete();
        $this->get('/storage/uploads/project/private-test.png')->assertNotFound();
        Storage::disk('public')->assertExists('uploads/project/private-test.png');
        Storage::disk('public')->assertExists('images/projects/fomin/fomin-dashboard.png');
        $this->assertFileDoesNotExist(public_path('images/projects/fomin/fomin-dashboard.png'));
        $publicMedia = Project::where('confidential', false)->firstOrFail()->media()->firstOrFail();
        $this->get('/storage/'.$publicMedia->path)->assertOk();
        $this->head('/storage/'.$publicMedia->path)->assertOk();
        $this->get('/'.$publicMedia->path)->assertOk();
        $this->get('/storage/../.env')->assertNotFound();
        Storage::disk('public')->put('.private-test.txt', 'PRIVATE-HIDDEN-FILE');
        $this->get('/storage/.private-test.txt')->assertNotFound()->assertDontSee('PRIVATE-HIDDEN-FILE');
    }

    public function test_non_confidential_content_and_translated_activity_type_remain_dynamic(): void
    {
        $project = Project::where('confidential', false)->firstOrFail();
        $dto = app(PortfolioData::class)->project($project);
        $this->assertSame($project->title, $dto['title']);
        $this->assertSame($project->description, $dto['description']);
        $activity = new Activity(['title' => ['fr' => 'Formation', 'en' => 'Training'], 'slug' => ['fr' => 'formation', 'en' => 'training'], 'type' => 'Formation']);
        $this->assertSame(['fr' => 'Formation', 'en' => 'Training'], app(PortfolioData::class)->activity($activity)['type']);
    }
}
