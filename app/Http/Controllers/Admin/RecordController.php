<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Certification;
use App\Models\Education;
use App\Models\Experience;
use App\Models\SiteSetting;
use App\Models\Skill;
use App\Models\SkillCategory;
use App\Models\SocialLink;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class RecordController extends Controller
{
    private function module(Request $r): string
    {
        return $r->route()->defaults['module'];
    }

    private function model(Request $r): string
    {
        return ['experiences' => Experience::class, 'education' => Education::class, 'certifications' => Certification::class, 'skill-categories' => SkillCategory::class, 'skills' => Skill::class, 'social-links' => SocialLink::class][$this->module($r)];
    }

    private function fields(Request $r): array
    {
        return match ($this->module($r)) {
            'experiences' => ['organization' => 'text', 'role' => 'translated', 'description' => 'translated', 'contributions' => 'contributions', 'period' => 'text', 'started_at' => 'date', 'ended_at' => 'date', 'current' => 'boolean', 'sort_order' => 'number'],
            'education' => ['organization' => 'text', 'title' => 'translated', 'description' => 'translated', 'period' => 'text', 'started_at' => 'date', 'ended_at' => 'date', 'current' => 'boolean', 'sort_order' => 'number'],
            'certifications' => ['organization' => 'text', 'title' => 'translated', 'description' => 'translated', 'sort_order' => 'number'],
            'skill-categories' => ['title' => 'translated', 'description' => 'translated', 'sort_order' => 'number'],
            'skills' => ['name' => 'text', 'skill_category_id' => 'category', 'sort_order' => 'number', 'visible' => 'boolean'],
            'social-links' => ['platform' => 'platform', 'url' => 'url', 'enabled' => 'boolean', 'sort_order' => 'number'],
        };
    }

    private function rules(Request $r): array
    {
        $rules = [];
        foreach ($this->fields($r) as $field => $type) {
            $rules[$field] = match ($type) {
                'translated' => 'required|array:fr,en', 'number' => 'required|integer|min:0|max:100000', 'boolean' => 'required|boolean',
                'date' => 'nullable|date', 'category' => 'required|integer|exists:skill_categories,id', 'contributions' => 'nullable|array|max:30',
                'platform' => ['required', Rule::in(['WhatsApp', 'LinkedIn', 'Instagram', 'Email', 'GitHub']), Rule::unique('social_links', 'platform')->ignore($r->route('id'))],
                'url' => 'nullable|string|max:2048', default => ($field === 'period' ? 'nullable' : 'required').'|string|max:250',
            };
            if ($type === 'translated') {
                foreach (['fr', 'en'] as $l) {
                    $rules[$field.'.'.$l] = 'required|string|max:20000';
                }
            }
        }
        if (array_key_exists('contributions', $rules)) {
            $rules['contributions.*'] = 'array:fr,en';
            $rules['contributions.*.fr'] = 'required|string|max:2000';
            $rules['contributions.*.en'] = 'required|string|max:2000';
        }
        if (array_key_exists('ended_at', $rules)) {
            $rules['ended_at'] .= '|after_or_equal:started_at';
        }

        return $rules;
    }

    public function index(Request $r)
    {
        return Inertia::render('admin/record-index', ['module' => $this->module($r), 'items' => $this->model($r)::orderBy('sort_order')->paginate(20)]);
    }

    public function create(Request $r)
    {
        return $this->editor($r);
    }

    public function edit(Request $r, int $id)
    {
        return $this->editor($r, $this->model($r)::findOrFail($id));
    }

    private function editor(Request $r, $item = null)
    {
        return Inertia::render('admin/record-edit', ['module' => $this->module($r), 'fields' => $this->fields($r), 'item' => $item, 'categories' => SkillCategory::orderBy('sort_order')->get(['id', 'title'])]);
    }

    public function store(Request $r)
    {
        return $this->save($r);
    }

    public function update(Request $r, int $id)
    {
        return $this->save($r, $id);
    }

    private function save(Request $r, ?int $id = null)
    {
        $data = $r->validate($this->rules($r));
        if ($this->module($r) === 'social-links') {
            $url = $data['url'] ?? '';
            $platform = $data['platform'];
            $allowed = match ($platform) {
                'Email' => preg_match('/^mailto:[^\s<>]+@[^\s<>]+$/', $url), 'WhatsApp' => preg_match('~^https://wa\.me/[0-9]+$~', $url),
                'LinkedIn' => preg_match('~^https://(www\.)?linkedin\.com/~', $url), 'Instagram' => preg_match('~^https://(www\.)?instagram\.com/[A-Za-z0-9._]+/?$~', $url), 'GitHub' => preg_match('~^https://github\.com/[A-Za-z0-9_-]+/?$~', $url)
            };
            if (($url || $data['enabled']) && ! $allowed) {
                throw ValidationException::withMessages(['url' => __('admin.Adresse officielle valide requise pour cette plateforme.')]);
            }
        }

        $model = $this->model($r);
        $item = $id ? $model::findOrFail($id) : new $model;
        $item->fill($data)->save();
        if ($item instanceof SocialLink && $item->enabled) {
            if ($item->platform === 'Email') {
                SiteSetting::updateOrCreate(['key' => 'email'], ['value' => substr($item->url, 7)]);
            } elseif ($item->platform === 'WhatsApp') {
                SiteSetting::updateOrCreate(['key' => 'whatsapp'], ['value' => substr($item->url, strlen('https://wa.me/'))]);
            }
        }

        return redirect('/admin/'.$this->module($r))->with('success', __('ui.saved'));
    }

    public function destroy(Request $r, int $id)
    {
        $item = $this->model($r)::findOrFail($id);
        if ($item instanceof SkillCategory && $item->skills()->exists()) {
            return back()->with('error', __('admin.Déplacez ou supprimez les compétences avant cette catégorie.'));
        }
        $item->delete();

        return back()->with('success', __('ui.deleted'));
    }
}
