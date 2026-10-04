<?php

namespace App\Services;

class PageMeta
{
    public function make(string $key, $content = null, bool $preview = false): array
    {
        $locale = app()->getLocale();
        $profile = app(PortfolioData::class)->profile();
        $base = rtrim(config('app.url'), '/');
        $segments = ['home' => ['', ''], 'projects' => ['projets', 'projects'], 'about' => ['a-propos', 'about'], 'activities' => ['activites', 'activities'], 'publications' => ['publications', 'publications'], 'contact' => ['contact', 'contact']];
        $paths = [];
        foreach (['fr', 'en'] as $l) {
            if ($content && (! $content->translated('slug', $l) || ! $content->translated('title', $l))) {
                continue;
            }
            $paths[$l] = ($l === 'en' ? '/en' : '').($key === 'home' ? ($l === 'fr' ? '/' : '') : '/'.$segments[$key][$l === 'fr' ? 0 : 1]).($content ? '/'.$content->translated('slug', $l) : '');
        }
        $title = $content ? ($content->translated('seo_title') ?: $content->translated('title')) : ($key === 'home' ? ($profile['seo_title'][$locale] ?? __('ui.title')) : __('ui.nav.'.$key));
        $title = $key === 'home' ? ($profile['name'] ?? 'Espoir Mulela Mastolo').' — '.$title : $title.' — '.($profile['name'] ?? 'Espoir Mulela Mastolo');
        $description = $content ? ($content->translated('seo_description') ?: $content->translated($key === 'activities' ? 'summary' : 'excerpt')) : ($profile['seo_description'][$locale] ?? '');
        $canonical = $base.($paths[$locale] ?? '/');
        $alternates = array_map(fn ($path) => $base.$path, $paths);
        $breadcrumbs = [['@type' => 'ListItem', 'position' => 1, 'name' => __('ui.nav.home'), 'item' => $base.($locale === 'fr' ? '/' : '/en')]];
        if ($key !== 'home') {
            $breadcrumbs[] = ['@type' => 'ListItem', 'position' => 2, 'name' => __('ui.nav.'.$key), 'item' => $base.($locale === 'en' ? '/en' : '').'/'.$segments[$key][$locale === 'fr' ? 0 : 1]];
        }
        if ($content) {
            $breadcrumbs[] = ['@type' => 'ListItem', 'position' => 3, 'name' => $content->translated('title'), 'item' => $canonical];
        }
        $jsonLd = ['@context' => 'https://schema.org', '@graph' => [
            ['@type' => 'Person', '@id' => $base.'/#person', 'name' => $profile['name'] ?? '', 'url' => $base, 'jobTitle' => $profile['professional_title'][$locale] ?? '',
                'image' => $base.($profile['portrait']['src'] ?? ''), 'sameAs' => collect($profile['socials'] ?? [])->whereIn('name', ['LinkedIn', 'Instagram'])->pluck('href')->all()],
            ['@type' => 'WebSite', '@id' => $base.'/#website', 'name' => $profile['name'] ?? '', 'url' => $base, 'inLanguage' => ['fr', 'en']],
            ['@type' => 'BreadcrumbList', 'itemListElement' => $breadcrumbs],
        ]];
        if ($key === 'publications' && $content) {
            $jsonLd['@graph'][] = ['@type' => 'Article', 'headline' => $content->translated('title'), 'description' => $description,
                'datePublished' => $content->published_at?->toIso8601String(), 'inLanguage' => $locale, 'url' => $canonical, 'author' => ['@id' => $base.'/#person']];
        }

        return ['title' => $title, 'description' => $description, 'canonical' => $canonical, 'alternates' => $alternates,
            'robots' => ! $preview && config('portfolio.indexable') ? 'index, follow' : 'noindex, follow',
            'image' => $base.'/og/'.$locale.'.png', 'jsonLd' => $jsonLd, 'switchUrl' => $paths[$locale === 'fr' ? 'en' : 'fr'] ?? ($locale === 'fr' ? '/en' : '/')];
    }
}
