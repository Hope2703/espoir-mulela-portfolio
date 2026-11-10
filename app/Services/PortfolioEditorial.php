<?php

namespace App\Services;

use App\Models\Activity;
use App\Models\Certification;
use App\Models\Education;
use App\Models\SkillCategory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use RuntimeException;

class PortfolioEditorial
{
    public function source(): array
    {
        return json_decode(file_get_contents(database_path('seeders/data/portfolio.json')), true, flags: JSON_THROW_ON_ERROR);
    }

    public function activityAttributes(array $data): array
    {
        $education = array_column($data['education'], null, 'organization');

        return array_map(function (array $activity) use ($education): array {
            $course = $education[$activity['education_organization']];
            unset($activity['education_organization']);
            $activity['title'] = $course['title'];
            $activity['summary'] = $course['description'];
            Validator::make($activity, ['summary.fr' => 'required|string|max:1000', 'summary.en' => 'required|string|max:1000'])->validate();

            return $activity;
        }, $data['activities']);
    }

    public function syncActivities(array $activities, bool $refreshExisting = false): int
    {
        $changed = 0;
        foreach ($activities as $attributes) {
            $matches = Activity::withTrashed()->where('slug->fr', $attributes['slug']['fr'])
                ->orWhere('slug->en', $attributes['slug']['en'])->limit(2)->lockForUpdate()->get();
            if ($matches->count() > 1) {
                throw new RuntimeException('Les adresses FR et EN de la formation correspondent à des fiches différentes.');
            }
            $activity = $matches->first();
            if (! $activity) {
                Activity::create($attributes + ['published_at' => $attributes['status'] === 'published' ? now() : null]);
                $changed++;
            } elseif ($refreshExisting && ! $activity->trashed()) {
                $publicFields = array_intersect_key($attributes, array_flip(['title', 'summary', 'description']));
                $frenchDescription = $activity->description['fr'] ?? '';
                if (filled($frenchDescription) && ! str_contains($frenchDescription, 'mon travail est principalement centré sur les fondamentaux')) {
                    unset($publicFields['description']['fr']);
                }
                $changed += $this->saveChanged($activity, $publicFields);
            }
        }

        return $changed;
    }

    public function refresh(): int
    {
        $data = $this->source();
        $activities = $this->activityAttributes($data);

        return DB::transaction(function () use ($data, $activities): int {
            $changed = $this->syncActivities($activities, refreshExisting: true);
            foreach ($data['education'] as $course) {
                if (! in_array($course['organization'], ['Kadea Academy', 'Université Protestante au Congo — UPC'], true)) {
                    continue;
                }
                $matches = Education::where('organization', $course['organization'])->where('period', $course['period'])->limit(2)->lockForUpdate()->get();
                if ($matches->count() > 1) {
                    throw new RuntimeException('Plusieurs entrées correspondent au même établissement et à la même période.');
                }
                if ($record = $matches->first()) {
                    $fields = ['title' => $course['title'], 'description' => $course['description']];
                    if ($course['organization'] === 'Kadea Academy') {
                        $fields['current'] = true;
                    }
                    $changed += $this->saveChanged($record, $fields);
                }
            }

            $duolingo = collect($data['certifications'])->firstWhere('title', 'Duolingo English Test');
            $certification = Certification::where('organization', $duolingo['organization'])
                ->where('title->fr', $duolingo['title'])->where('title->en', $duolingo['title'])->first();
            if ($certification) {
                $changed += $this->saveChanged($certification, ['description' => $duolingo['detail']]);
            }

            $skills = collect($data['skills'])->first(fn (array $category) => $category['title']['fr'] === 'IA & Data');
            $category = SkillCategory::where('title->fr', $skills['title']['fr'])->where('title->en', $skills['title']['en'])->lockForUpdate()->first();
            if ($category) {
                $changed += $this->saveChanged($category, ['description' => $skills['description']]);
                $order = (int) $category->skills()->max('sort_order');
                foreach ($skills['tools'] as $tool) {
                    $skill = $category->skills()->firstOrCreate(['name' => $tool], ['sort_order' => $order + 1]);
                    if ($skill->wasRecentlyCreated) {
                        $order++;
                        $changed++;
                    }
                }
            }

            return $changed;
        }, 3);
    }

    private function saveChanged(Model $record, array $fields): int
    {
        foreach ($fields as $field => $value) {
            $record->setAttribute($field, is_array($value) ? array_replace($record->getAttribute($field) ?? [], $value) : $value);
        }
        if (! $record->isDirty()) {
            return 0;
        }

        $record->save();

        return 1;
    }
}
