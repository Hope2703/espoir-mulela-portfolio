<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ContentRequest;
use App\Models\Activity;
use App\Models\Project;
use App\Models\Publication;
use App\Services\PageMeta;
use App\Services\PortfolioData;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ContentController extends Controller
{
    protected function type(Request $request): string
    {
        return $request->route()->defaults['content_type'];
    }

    protected function model(Request $request): string
    {
        return ['projects' => Project::class, 'activities' => Activity::class, 'publications' => Publication::class][$this->type($request)];
    }

    public function index(Request $r)
    {
        $model = $this->model($r);
        $q = $model::query();
        if ($r->filled('search')) {
            $search = mb_strtolower(mb_substr($r->string('search'), 0, 100));
            $q->whereRaw('LOWER(CAST(title AS TEXT)) LIKE ?', ['%'.$search.'%']);
        }
        if (in_array($r->input('status'), ['draft', 'published', 'archived'])) {
            $q->where('status', $r->input('status'));
        }

        return Inertia::render('admin/content-index', ['contentType' => $this->type($r), 'items' => $q->orderBy('sort_order')->latest('id')->paginate(15)->withQueryString(), 'filters' => $r->only('search', 'status')]);
    }

    public function create(Request $r)
    {
        return Inertia::render('admin/content-edit', ['contentType' => $this->type($r), 'item' => null]);
    }

    public function edit(Request $r, int $id)
    {
        $item = $this->model($r)::findOrFail($id);
        if (method_exists($item, 'media')) {
            $item->load('media');
        }

        $props = $item->toArray();
        $props['published_at'] = $item->published_at?->timezone(config('app.timezone'))->format('Y-m-d\TH:i');

        return Inertia::render('admin/content-edit', ['contentType' => $this->type($r), 'item' => $props]);
    }

    public function store(ContentRequest $r)
    {
        return $this->save($r);
    }

    public function update(ContentRequest $r, int $id)
    {
        return $this->save($r, $id);
    }

    private function save(ContentRequest $r, ?int $id = null)
    {
        $model = $this->model($r);
        $data = $r->validated();
        if ($data['status'] === 'published' && empty($data['published_at'])) {
            $data['published_at'] = now();
        }
        $item = DB::transaction(function () use ($model, $data, $id) {
            $item = $id ? $model::findOrFail($id) : new $model;
            $item->fill($data);
            $item->save();

            return $item;
        });

        return redirect('/admin/'.$this->type($r).'/'.$item->id.'/edit')->with('success', __('admin.'.$this->type($r).($id ? '.updated' : '.created')));
    }

    public function archive(Request $r, string $type, int $id)
    {
        $model = ['projects' => Project::class, 'activities' => Activity::class, 'publications' => Publication::class][$type];
        $model::findOrFail($id)->update(['status' => 'archived']);

        return back()->with('success', __('admin.Contenu archivé.'));
    }

    public function destroy(Request $r, int $id)
    {
        $this->model($r)::findOrFail($id)->delete();

        return redirect('/admin/'.$this->type($r))->with('success', __('admin.'.$this->type($r).'.deleted'));
    }

    public function preview(Request $r, int $id, PortfolioData $data, PageMeta $meta)
    {
        app()->setLocale($r->query('locale') === 'en' ? 'en' : 'fr');
        $type = $this->type($r);
        $item = $this->model($r)::findOrFail($id);
        $singular = ['projects' => 'project', 'activities' => 'activity', 'publications' => 'publication'][$type];
        $props = ['meta' => $meta->make($type, $item, true), 'preview' => true, 'locale' => app()->getLocale(), 'portfolio' => $data->profile(), $singular => $data->$singular($item)];
        if ($type === 'projects') {
            $props['projects'] = [$data->project($item)];
        }

        return Inertia::render('public/'.$singular.'-show', $props);
    }
}
