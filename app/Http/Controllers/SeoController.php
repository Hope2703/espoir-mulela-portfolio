<?php

namespace App\Http\Controllers;

use App\Models\Activity;
use App\Models\Project;
use App\Models\Publication;

class SeoController extends Controller
{
    public function sitemap()
    {
        $entries = [];
        foreach (['fr', 'en'] as $locale) {
            foreach (['home', 'projects', 'about', 'activities', 'publications', 'contact'] as $key) {
                $entries[] = ['url' => route('public.'.$locale.'.'.$key), 'modified' => null];
            }
            foreach (['projects' => Project::class, 'activities' => Activity::class, 'publications' => Publication::class] as $key => $model) {
                foreach ($model::published()->get() as $item) {
                    if ($item->translated('slug', $locale)) {
                        $entries[] = ['url' => route('public.'.$locale.'.'.$key.'.show', ['slug' => $item->translated('slug', $locale)]), 'modified' => $item->updated_at->toAtomString()];
                    }
                }
            }
        }
        $xml = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
        foreach ($entries as $e) {
            $xml .= '<url><loc>'.htmlspecialchars($e['url'], ENT_XML1).'</loc>'.($e['modified'] ? '<lastmod>'.$e['modified'].'</lastmod>' : '').'</url>';
        }

        return response($xml.'</urlset>', 200, ['Content-Type' => 'application/xml']);
    }

    public function robots()
    {
        return response("User-agent: *\n".(config('portfolio.indexable') ? "Disallow: /admin\nDisallow: /login\nDisallow: /forgot-password\nDisallow: /reset-password\n" : "Disallow: /\n").'Sitemap: '.url('/sitemap.xml')."\n", 200, ['Content-Type' => 'text/plain']);
    }

    public function image(string $locale)
    {
        return response()->file(public_path('images/og/'.$locale.'.png'), ['Content-Type' => 'image/png', 'Cache-Control' => 'public, max-age=86400']);
    }
}
