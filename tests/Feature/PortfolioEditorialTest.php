<?php

namespace Tests\Feature;

use App\Models\Activity;
use App\Models\Education;
use App\Models\SkillCategory;
use Database\Seeders\PortfolioContentSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PortfolioEditorialTest extends TestCase
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

    public function test_the_seed_uses_the_same_kadea_summary_for_the_journey_activity_and_metadata(): void
    {
        $activity = Activity::published()->sole();
        $training = Education::where('organization', 'Kadea Academy')->sole();
        $this->assertSame('2026', $training->period);
        $this->assertTrue($training->current);
        $this->assertLessThanOrEqual(1000, mb_strlen($activity->summary['en']));

        foreach (['fr' => ['', 'activites', 'a-propos'], 'en' => ['/en', 'activities', 'about']] as $locale => [$prefix, $segment, $about]) {
            $summary = $activity->summary[$locale];
            $this->assertSame($training->description[$locale], $summary);
            $this->assertDoesNotMatchRegularExpression('/\*\*|##|```/', $summary);
            $this->get($prefix ?: '/')->assertOk()->assertInertia(fn (Assert $page) => $page
                ->where('portfolio.journeyNotes.0.description.'.$locale, $summary)
                ->where('activities.0.description.'.$locale, $summary));
            $this->get($prefix.'/'.$about)->assertOk()->assertInertia(fn (Assert $page) => $page
                ->where('education.1.description.'.$locale, $summary)
                ->where('education.1.current', true));
            $this->get($prefix.'/'.$segment)->assertOk()->assertInertia(fn (Assert $page) => $page
                ->where('activities.0.description.'.$locale, $summary));
            $this->get($prefix.'/'.$segment.'/'.$activity->slug[$locale])->assertOk()->assertInertia(fn (Assert $page) => $page
                ->where('activity.description.'.$locale, $summary)
                ->where('meta.description', $summary)
                ->where('activity.html.'.$locale, fn (string $html) => str_contains($html, '<h3>ForexAnalytics</h3>')));
        }
    }

    public function test_refresh_updates_only_the_intended_fields_and_is_idempotent(): void
    {
        $activity = Activity::sole();
        $currentFrenchDescription = "## Travaux actuels\n\nPipeline ETL et projet ForexAnalytics.";
        $activity->update([
            'title' => ['fr' => 'Ancien titre', 'en' => 'Old title'],
            'summary' => ['fr' => 'Ancien résumé', 'en' => 'Old summary'],
            'description' => ['fr' => $currentFrenchDescription, 'en' => 'Old description'],
            'status' => 'archived',
            'external_url' => 'https://example.test/kadea',
            'sort_order' => 37,
        ]);
        $media = $activity->media()->create(['path' => 'uploads/activity/test.jpg', 'alt' => ['fr' => 'Image', 'en' => 'Image'], 'width' => 100, 'height' => 100]);
        $fieldsToPreserve = ['slug', 'status', 'event_date', 'published_at', 'role', 'location', 'external_url', 'sort_order'];
        $before = $activity->only($fieldsToPreserve);
        $newHope = Education::where('organization', 'New Hope College')->sole();
        $newHopeBefore = $newHope->getRawOriginal();
        $training = Education::where('organization', 'Kadea Academy')->sole();
        $training->update(['current' => false, 'description' => ['fr' => 'Ancien texte', 'en' => 'Old text']]);
        $category = SkillCategory::where('title->fr', 'IA & Data')->sole();
        $category->skills()->where('name', 'Flask')->delete();
        $category->skills()->where('name', 'Python')->update(['visible' => false]);

        $this->artisan('portfolio:refresh-editorial')->assertSuccessful();

        $activity->refresh();
        $this->assertEquals($before, $activity->only($fieldsToPreserve));
        $this->assertSame($currentFrenchDescription, $activity->description['fr']);
        $this->assertStringContainsString('Flask', $activity->description['en']);
        $this->assertEquals($activity->summary, $training->fresh()->description);
        $this->assertTrue($training->fresh()->current);
        $this->assertSame($newHopeBefore, $newHope->fresh()->getRawOriginal());
        $this->assertSame($media->id, $activity->media()->sole()->id);
        $this->assertFalse($category->skills()->where('name', 'Python')->sole()->visible);
        $this->assertTrue($category->skills()->where('name', 'Flask')->exists());

        $this->travel(1)->minute();
        $this->artisan('portfolio:refresh-editorial')->expectsOutput('0 enregistrement(s) mis à jour.')->assertSuccessful();
        $this->assertDatabaseCount('activities', 1);
    }
}
