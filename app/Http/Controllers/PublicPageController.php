<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Project;
use App\Models\Publication;
use App\Services\PageMeta;
use App\Services\PortfolioData;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PublicPageController extends Controller
{
    public function __invoke(Request $request, PortfolioData $data, PageMeta $meta)
    {
        $key = $request->route()->defaults['page'];
        $props = ['pageKey' => $key, 'meta' => $meta->make($key)];
        if (in_array($key, ['home', 'projects'])) {
            $props['projects'] = $data->projects();
        }
        if ($key === 'about') {
            $props += $data->journey();
        }
        if (in_array($key, ['home', 'publications'])) {
            $props['publications'] = Publication::published()->latest('published_at')->get()->map(fn ($p) => $data->publication($p))->all();
        }
        if (in_array($key, ['home', 'activities'])) {
            $props['activities'] = Activity::published()->with('media')->latest('published_at')->get()->map(fn ($a) => $data->activity($a))->all();
        }

        return Inertia::render('public/'.$key, $props);
    }

    public function show(Request $request, string $slug, PortfolioData $data, PageMeta $meta)
    {
        $key = $request->route()->defaults['page'];
        $class = ['projects' => Project::class, 'publications' => Publication::class, 'activities' => Activity::class][$key];
        $content = $class::published()->forSlug($slug, app()->getLocale())->firstOrFail();
        $request->attributes->set('viewable_type', $key);
        $request->attributes->set('viewable_id', $content->id);
        $props = ['meta' => $meta->make($key, $content), 'pageKey' => $key];
        if ($key === 'projects') {
            $props += ['project' => $data->project($content), 'projects' => $data->projects()];
        }
        if ($key === 'publications') {
            $props['publication'] = $data->publication($content);
        }
        if ($key === 'activities') {
            $props['activity'] = $data->activity($content);
        }

        return Inertia::render('public/'.(['projects' => 'project', 'publications' => 'publication', 'activities' => 'activity'][$key]).'-show', $props);
    }
}
