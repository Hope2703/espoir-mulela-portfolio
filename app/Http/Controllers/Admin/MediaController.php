<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\ActivityMedia;
use App\Models\Project;
use App\Models\ProjectMedia;
use App\Models\Publication;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class MediaController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('admin/media', ['projects' => Project::with('media')->orderBy('sort_order')->get(['id', 'title', 'confidential']), 'activities' => Activity::with('media')->get(['id', 'title']), 'publications' => Publication::get(['id', 'title', 'cover']), 'selection' => ['type' => in_array($request->query('owner_type'), ['project', 'activity', 'publication', 'portrait']) ? $request->query('owner_type') : 'project', 'id' => (int) $request->query('owner_id')]]);
    }

    public function store(Request $r)
    {
        $valid = $r->validate(['owner_type' => 'required|in:project,activity,publication,portrait', 'owner_id' => 'nullable|integer',
            'file' => 'required|image|mimes:jpg,jpeg,png,webp|mimetypes:image/jpeg,image/png,image/webp|max:8192|dimensions:min_width=100,min_height=100,max_width=6000,max_height=6000',
            'alt' => 'required|array:fr,en', 'alt.fr' => 'required|string|max:300', 'alt.en' => 'required|string|max:300', 'type' => 'required|in:cover,mobile,desktop,other', 'sort_order' => 'required|integer|min:0|max:10000']);
        $kind = $valid['owner_type'];
        $model = match ($kind) {
            'project' => Project::class,'activity' => Activity::class,'publication' => Publication::class,default => null
        };
        $owner = $model ? $model::findOrFail($valid['owner_id']) : null;
        if ($kind === 'project' && $owner->confidential) {
            throw ValidationException::withMessages(['owner_id' => __('admin.Aucun média public pour un projet confidentiel.')]);
        }
        $image = $r->file('file');
        [$width,$height] = getimagesize($image->getPathname());
        $path = $image->store('uploads/'.$kind, 'public');
        try {
            DB::transaction(function () use ($kind, $owner, $path, $valid, $width, $height) {
                if ($kind === 'publication') {
                    $owner->update(['cover' => $path]);
                } elseif ($kind === 'portrait') {
                    SiteSetting::updateOrCreate(['key' => 'portrait'], ['value' => ['src' => Storage::url($path), 'alt' => $valid['alt'], 'width' => $width, 'height' => $height, 'kind' => 'portrait']]);
                } else {
                    $owner->media()->create(['path' => $path, 'alt' => $valid['alt'], 'type' => $valid['type'], 'sort_order' => $valid['sort_order'], 'width' => $width, 'height' => $height]);
                }
            });
        } catch (\Throwable $e) {
            Storage::disk('public')->delete($path);
            throw $e;
        }

        return back()->with('success', __('admin.Média ajouté.'));
    }

    private function model(string $type): string
    {
        return $type === 'project' ? ProjectMedia::class : ActivityMedia::class;
    }

    public function update(Request $r, string $type, int $id)
    {
        $valid = $r->validate(['alt' => 'required|array:fr,en', 'alt.fr' => 'required|string|max:300', 'alt.en' => 'required|string|max:300',
            'type' => 'required|in:cover,mobile,desktop,other', 'sort_order' => 'required|integer|min:0|max:10000']);
        $this->model($type)::findOrFail($id)->update($valid);

        return back()->with('success', __('ui.saved'));
    }

    public function destroy(Request $r, string $type, int $id)
    {
        $media = $this->model($type)::findOrFail($id);
        $path = $media->path;
        if ($media->owner->status === 'published') {
            return back()->with('error', __('admin.Passez le contenu en brouillon avant de retirer son média.'));
        }
        $media->delete();
        $referenced = ProjectMedia::where('path', $path)->exists() || ActivityMedia::where('path', $path)->exists() || Publication::where('cover', $path)->exists()
            || SiteSetting::where('key', 'portrait')->get()->contains(fn ($s) => ($s->value['src'] ?? '') === Storage::url($path));
        if (! $referenced) {
            Storage::disk('public')->delete($path);
        }

        return back()->with('success', __('admin.Média retiré.'));
    }
}
