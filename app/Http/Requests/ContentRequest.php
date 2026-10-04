<?php

namespace App\Http\Requests;

use App\Models\Activity;
use App\Models\Project;
use App\Models\Publication;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ContentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->is_admin;
    }

    public function rules(): array
    {
        $type = $this->route()->defaults['content_type'];
        $rules = ['status' => ['required', Rule::in(['draft', 'published', 'archived'])], 'published_at' => 'nullable|date', 'sort_order' => 'sometimes|integer|min:0|max:100000'];
        $translated = ['title' => [true, 200], 'slug' => [true, 180], $type === 'activities' ? 'summary' : 'excerpt' => [true, 1000]];
        if ($type === 'publications') {
            $translated['body'] = [true, 200000];
        } else {
            $translated['description'] = [$type === 'projects', 50000];
            $translated['role'] = [false, 10000];
            $rules['external_url'] = 'nullable|url:http,https|max:2048';
        }
        if ($type !== 'activities') {
            $translated['seo_title'] = [false, 200];
            $translated['seo_description'] = [false, 1000];
        }
        if ($type === 'projects') {
            $translated['context'] = [false, 10000];
            $rules['featured'] = 'required|boolean';
            $rules['confidential'] = 'required|boolean';
        }
        if ($type === 'activities') {
            $translated['location'] = [false, 200];
            $rules['type'] = 'required|string|max:100';
            $rules['event_date'] = 'required|date';
        }
        foreach ($translated as $field => [$required,$max]) {
            $rules[$field] = ($required ? 'required' : 'nullable').'|array:fr,en';
            foreach (['fr', 'en'] as $l) {
                $rules[$field.'.'.$l] = ($required ? 'required' : 'nullable').'|string|max:'.$max;
                if ($field === 'slug') {
                    $rules[$field.'.'.$l] .= '|regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/';
                }
            }
        }

        return $rules;
    }

    public function after(): array
    {
        return [function ($validator) {
            $model = ['projects' => Project::class, 'activities' => Activity::class, 'publications' => Publication::class][$this->route()->defaults['content_type']];
            foreach (['fr', 'en'] as $l) {
                if ($model::withTrashed()->where('slug->'.$l, $this->input('slug.'.$l))->when($this->route('id'), fn ($q, $id) => $q->where('id', '!=', $id))->exists()) {
                    $validator->errors()->add('slug.'.$l, __('admin.Ce slug existe déjà.'));
                }
            }
            if ($this->boolean('confidential') && $this->filled('external_url')) {
                $validator->errors()->add('external_url', __('admin.Un projet confidentiel ne doit pas exposer de lien.'));
            }
        }];
    }
}
