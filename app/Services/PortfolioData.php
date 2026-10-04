<?php

namespace App\Services;

use App\Models\Activity;
use App\Models\Certification;
use App\Models\Education;
use App\Models\Experience;
use App\Models\Project;
use App\Models\Publication;
use App\Models\SiteSetting;
use App\Models\SkillCategory;
use App\Models\SocialLink;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class PortfolioData
{
    public function profile(): array
    {
        $settings = SiteSetting::pluck('value', 'key')->all();
        $settings['navigationName'] = implode(' ', array_slice(explode(' ', $settings['name'] ?? ''), 0, 2));
        $settings['location_short'] = $settings['location'] ?? ['fr' => '', 'en' => ''];
        $settings['hero_title'] = [];
        foreach (['fr', 'en'] as $locale) {
            $parts = array_map('trim', explode('/', $settings['professional_title'][$locale] ?? '', 2));
            $second = preg_split('/\s+/u', ucfirst($parts[1] ?? ''), 2);
            $settings['hero_title'][$locale] = rtrim($parts[0], '.').".\n".implode("\n", $second).($parts[1] ?? '' ? '.' : '');
        }
        $settings['journeyNotes'] = Education::orderByDesc('current')->orderBy('sort_order')->limit(1)->get()->map(fn ($e) => ['label' => ['fr' => 'Formation', 'en' => 'Education'], 'title' => $e->title, 'description' => $e->description, 'current' => $e->current])->concat(Experience::orderByDesc('current')->orderBy('sort_order')->limit(2)->get()->map(fn ($e) => ['label' => ['fr' => 'Expérience', 'en' => 'Experience'], 'title' => $e->role, 'description' => $e->description, 'current' => $e->current]))->all();
        $settings['socials'] = SocialLink::where('enabled', true)->orderBy('sort_order')->get()->map(fn ($s) => ['name' => $s->platform, 'label' => match ($s->platform) {
            'Email' => substr($s->url, 7), 'WhatsApp' => '+'.substr($s->url, strlen('https://wa.me/')), default => $s->platform
        }, 'href' => $s->url])->all();

        return $settings;
    }

    public function project(Project $p): array
    {
        $empty = ['fr' => '', 'en' => ''];

        return ['id' => $p->content_key ?? (string) $p->id, 'databaseId' => $p->id, 'slug' => $p->translated('slug'), 'slugs' => $p->slug,
            'title' => $p->title, 'shortDescription' => $p->excerpt ?? $empty, 'description' => $p->description ?? $empty,
            'context' => $p->context ?? $empty, 'role' => $p->role, 'html' => ['fr' => $this->markdown($p->description['fr'] ?? ''), 'en' => $this->markdown($p->description['en'] ?? '')], 'featured' => $p->featured, 'confidential' => $p->confidential,
            'media' => ($p->confidential ? $p->media->where('public_safe', true) : $p->media)->map(fn ($m) => ['src' => Storage::url($m->path), 'alt' => $m->alt, 'width' => $m->width, 'height' => $m->height, 'kind' => 'screenshot'])->values()->all(),
            'links' => $p->confidential ? [] : array_values(array_filter([
                $p->external_url ? ['type' => 'official', 'url' => $p->external_url] : null,
            ]))];
    }

    public function projects(): array
    {
        return Project::published()->with('media')->orderBy('sort_order')->orderBy('id')->get()->map(fn ($p) => $this->project($p))->all();
    }

    public function journey(): array
    {
        return ['experiences' => Experience::orderBy('sort_order')->get()->toArray(), 'education' => Education::orderBy('sort_order')->get()->toArray(),
            'certifications' => Certification::orderBy('sort_order')->get()->map(fn ($c) => ['organization' => $c->organization, 'title' => $c->translated('title'), 'detail' => $c->description])->all(),
            'skills' => SkillCategory::with(['skills' => fn ($q) => $q->where('visible', true)->orderBy('sort_order')])->orderBy('sort_order')->get()->map(fn ($c) => ['title' => $c->title, 'description' => $c->description, 'tools' => $c->skills->pluck('name')])->all()];
    }

    public function publication(Publication $p): array
    {
        return ['slug' => $p->translated('slug'), 'slugs' => $p->slug, 'title' => $p->translated('title'), 'description' => $p->translated('excerpt'),
            'date' => $p->published_at?->toDateString(), 'readingTime' => max(1, (int) ceil(str_word_count(strip_tags($this->markdown($p->translated('body')))) / 200)), 'status' => $p->status,
            'cover' => $p->cover ? Storage::url($p->cover) : null, 'langue' => app()->getLocale(), 'file' => '', 'html' => $this->markdown($p->translated('body'))];
    }

    public function activity(Activity $a): array
    {
        return ['id' => (string) $a->id, 'slug' => $a->translated('slug'), 'slugs' => $a->slug, 'title' => $a->title,
            'description' => $a->summary, 'body' => $a->description, 'type' => ['fr' => $a->type, 'en' => $a->type], 'role' => $a->role, 'location' => $a->location,
            'html' => ['fr' => $this->markdown($a->description['fr'] ?? ''), 'en' => $this->markdown($a->description['en'] ?? '')],
            'date' => $a->event_date?->toDateString(), 'externalUrl' => $a->external_url, 'status' => $a->status,
            'media' => $a->media->map(fn ($m) => ['src' => Storage::url($m->path), 'alt' => $m->alt])->all()];
    }

    public function markdown(string $body): string
    {
        return (string) Str::markdown($body, ['html_input' => 'strip', 'allow_unsafe_links' => false]);
    }
}
