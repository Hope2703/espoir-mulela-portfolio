<?php

namespace Database\Seeders;

use App\Models\Certification;
use App\Models\Education;
use App\Models\Experience;
use App\Models\Project;
use App\Models\SiteSetting;
use App\Models\SkillCategory;
use App\Models\SocialLink;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class PortfolioContentSeeder extends Seeder
{
    public function run(): void
    {
        $data = json_decode(file_get_contents(__DIR__.'/data/portfolio.json'), true, flags: JSON_THROW_ON_ERROR);
        DB::transaction(function () use ($data) {
            foreach ($data['projects'] as $order => $p) {
                if (Project::withTrashed()->where('content_key', $p['id'])->exists()) {
                    continue;
                }
                $links = collect($p['links'])->filter(fn ($l) => ($l['enabled'] ?? true) && ! $p['confidential']);
                $project = Project::create([
                    'content_key' => $p['id'], 'title' => $p['title'], 'slug' => ['fr' => $p['slug'], 'en' => $p['slug']],
                    'excerpt' => $p['shortDescription'], 'description' => $p['description'], 'role' => $p['role'] ?? null,
                    'context' => $p['context'], 'featured' => $p['featured'],
                    'confidential' => $p['confidential'], 'sort_order' => $order, 'status' => 'published', 'published_at' => now(),
                    'external_url' => $links->firstWhere('type', 'official')['url'] ?? null,
                ]);
                foreach ($p['media'] as $i => $m) {
                    $safe = $p['id'] === 'institutionnel' && $m['src'] === '/images/projects/fomin/fomin-dashboard.png'
                        && hash_file('sha256', public_path(ltrim($m['src'], '/'))) === '81fa8730c19457b68d4a757f7bb434084f4ad439edcc6fcc9e63e56fdb15e325';
                    if ($p['confidential'] && ! $safe) {
                        continue;
                    }
                    $path = ltrim($m['src'], '/');
                    Storage::disk('public')->put($path, file_get_contents(public_path($path)));
                    $project->media()->create(['type' => $m['type'] ?? ($i === 0 ? 'cover' : ($p['id'] === 'maliyaflow' ? 'mobile' : 'desktop')), 'path' => $path,
                        'alt' => $m['alt'], 'width' => $m['width'], 'height' => $m['height'], 'sort_order' => $i, 'public_safe' => $safe]);
                }
            }
            foreach (['experiences' => Experience::class, 'education' => Education::class, 'certifications' => Certification::class] as $key => $model) {
                foreach ($data[$key] as $i => $row) {
                    if ($model::where('organization', $row['organization'])->exists()) {
                        continue;
                    }
                    if ($key === 'certifications') {
                        $row['description'] = $row['detail'];
                        unset($row['detail']);
                        $row['title'] = ['fr' => $row['title'], 'en' => $row['title']];
                    }
                    $model::create($row + ['sort_order' => $i] + ($key === 'certifications' ? [] : ['current' => $key === 'education' && $row['organization'] === 'Kadea Academy']));
                }
            }
            foreach ($data['skills'] as $i => $s) {
                if (SkillCategory::where('title->fr', $s['title']['fr'])->exists()) {
                    continue;
                }
                $category = SkillCategory::create(['title' => $s['title'], 'description' => $s['description'], 'sort_order' => $i]);
                foreach ($s['tools'] as $j => $tool) {
                    $category->skills()->create(['name' => $tool, 'sort_order' => $j]);
                }
            }
            foreach ($data['socialLinks'] as $i => $s) {
                SocialLink::firstOrCreate(['platform' => $s['name']], ['url' => $s['href'], 'sort_order' => $i]);
            }
            SocialLink::firstOrCreate(['platform' => 'Instagram'], ['url' => '', 'enabled' => false, 'sort_order' => 3]);
            $settings = $data['profile'];
            unset($settings['socials']);
            $portrait = $settings['portrait'];
            $portraitPath = ltrim($portrait['src'], '/');
            Storage::disk('public')->put($portraitPath, file_get_contents(public_path($portraitPath)));
            $settings['portrait']['src'] = '/storage/'.$portraitPath;
            $settings['professional_title'] = ['fr' => 'Ingénieur informatique / développeur Full-Stack', 'en' => 'Software engineer / Full-Stack developer'];

            $settings['email'] = 'espoirmulela67@gmail.com';
            $settings['whatsapp'] = '243853621283';
            $settings['seo_title'] = ['fr' => 'Ingénieur informatique & développeur Full-Stack', 'en' => 'Software Engineer & Full-Stack Developer'];
            $settings['seo_description'] = $settings['introduction'];
            foreach ($settings as $key => $value) {
                SiteSetting::firstOrCreate(['key' => $key], ['value' => $value]);
            }
        });
    }
}
