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
        $project->update($fields + ['content_key' => 'PRIVATE-CONTENT-KEY', 'external_url' => 'https://private-project.example.test']);
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
                ->where('project.title.'.$locale, __('portfolio.confidential_project_title', [], $locale))
                ->where('meta.description', __('portfolio.confidential_project_description', [], $locale))
                ->where('meta.jsonLd.@graph.2.itemListElement.2.name', __('portfolio.confidential_project_title', [], $locale))
                ->where('meta.switchUrl', $locale === 'fr' ? '/en/projects/'.$project->slug['en'] : '/projets/'.$project->slug['fr']));
        }
        $this->assertSame($before, $project->fresh()->getAttributes());
        $this->assertDatabaseHas('project_media', ['path' => 'PRIVATE-MEDIA.png', 'public_safe' => true]);
    }

    public function test_legacy_experience_is_protected_without_rewriting_its_fields_or_hiding_its_role(): void
    {
        $experience = Experience::where('organization', 'Taprinella Logistic SARL')->firstOrFail();
        $experience->update(['description' => ['fr' => 'PRIVATE-EXPERIENCE-FR', 'en' => 'PRIVATE-EXPERIENCE-EN'], 'contributions' => [['fr' => 'PRIVATE-CONTRIBUTION-FR', 'en' => 'PRIVATE-CONTRIBUTION-EN']], 'current' => true]);
        $before = $experience->getAttributes();
        $this->assertNull($experience->confidential);
        foreach (['/' => 'fr', '/en' => 'en', '/a-propos' => 'fr', '/en/about' => 'en'] as $url => $locale) {
            $this->get($url)->assertOk()->assertDontSee('PRIVATE-')->assertInertia(fn (Assert $page) => str_contains($url, 'about') || str_contains($url, 'a-propos')
                ? $page->where('experiences.2.role.'.$locale, $experience->role[$locale])
                : $page->where('portfolio.journeyNotes.1.title.'.$locale, $experience->role[$locale]));
        }
        $experience->update(['public_description' => ['fr' => 'Responsabilités générales autorisées.', 'en' => 'Approved general responsibilities.']]);
        foreach (['/a-propos' => 'fr', '/en/about' => 'en'] as $url => $locale) {
            $this->get($url)->assertOk()->assertDontSee('PRIVATE-')->assertInertia(fn (Assert $page) => $page->where('experiences.2.organization', $experience->organization)->where('experiences.2.description.'.$locale, $experience->public_description[$locale]));
        }
        $after = $experience->fresh()->getAttributes();
        foreach (['description', 'contributions', 'role', 'organization'] as $field) {
            $this->assertSame($before[$field], $after[$field]);
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

    public function test_admin_can_manage_privacy_and_public_responsibilities_without_losing_private_details(): void
    {
        $experience = Experience::where('organization', 'Taprinella Logistic SARL')->firstOrFail();
        $this->get('/admin/experiences/'.$experience->id.'/edit')->assertRedirect('/login');
        $this->actingAs(User::factory()->create(['is_admin' => true]));
        $this->get('/admin/experiences/'.$experience->id.'/edit')->assertInertia(fn (Assert $page) => $page->where('item.confidential', true)->where('item.description', $experience->description));
        $payload = $experience->only('organization', 'role', 'description', 'contributions', 'period', 'started_at', 'ended_at', 'current', 'sort_order') + ['confidential' => true, 'public_description' => ['fr' => 'Responsabilités publiques.', 'en' => 'Public responsibilities.']];
        $this->put('/admin/experiences/'.$experience->id, $payload)->assertSessionHasNoErrors();
        $this->assertSame($experience->description, $experience->fresh()->description);
        $this->assertSame($experience->contributions, $experience->fresh()->contributions);
        $this->assertTrue($experience->fresh()->confidential);
        $payload['public_description']['en'] = '';
        $this->put('/admin/experiences/'.$experience->id, $payload)->assertSessionHasErrors('public_description.en');
    }

    public function test_confidential_media_direct_urls_are_denied_without_deleting_files(): void
    {
        $project = Project::where('confidential', true)->firstOrFail();
        Storage::disk('public')->put('uploads/project/private-test.png', 'PRIVATE-FILE-CONTENTS');
        $project->media()->create(['path' => 'uploads/project/private-test.png', 'alt' => ['fr' => 'Privé', 'en' => 'Private'], 'public_safe' => true, 'type' => 'cover', 'width' => 200, 'height' => 200, 'sort_order' => 0]);
        foreach (['/storage/uploads/project/private-test.png', '/storage//uploads/project/private-test.png', '/storage/images/projects/fomin/fomin-dashboard.png', '/images/projects/fomin/fomin-dashboard.png', '/storage/IMAGES/PROJECTS/FOMIN/fomin-dashboard.png'] as $url) {
            $this->get($url)->assertNotFound()->assertDontSee('PRIVATE-FILE-CONTENTS');
            $this->head($url)->assertNotFound();
        }
        $project->delete();
        $this->get('/storage/uploads/project/private-test.png')->assertNotFound();
        Storage::disk('public')->assertExists('uploads/project/private-test.png');
        $this->assertFileExists(public_path('images/projects/fomin/fomin-dashboard.png'));
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
