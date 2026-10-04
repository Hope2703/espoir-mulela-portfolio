<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use App\Models\ContactMessage;
use App\Models\PageView;
use App\Models\Project;
use App\Models\Publication;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke()
    {
        $visitors = [];
        foreach ([1, 7, 30] as $days) {
            $visitors[$days] = PageView::where('created_at', '>=', now()->startOfDay()->subDays($days - 1))->distinct()->count('visitor_hash');
        }
        $views = PageView::where('viewable_type', 'projects')->where('created_at', '>=', now()->subDays(30))->select('viewable_id')->selectRaw('COUNT(*) as views')->groupBy('viewable_id')->orderByDesc('views')->limit(5)->get();
        $projects = Project::whereIn('id', $views->pluck('viewable_id'))->get()->keyBy('id');

        return Inertia::render('admin/dashboard', ['stats' => ['visitors' => $visitors, 'projects' => Project::published()->count(), 'publications' => Publication::published()->count(), 'activities' => Activity::published()->count(), 'unread' => ContactMessage::whereNull('read_at')->whereNull('archived_at')->count()],
            'pages' => PageView::where('created_at', '>=', now()->subDays(30))->select('path')->selectRaw('COUNT(*) as views')->groupBy('path')->orderByDesc('views')->limit(5)->get(),
            'topProjects' => $views->map(fn ($v) => ['label' => $projects->get($v->viewable_id)?->translated('title') ?? __('admin.Contenu supprimé'), 'views' => $v->views]),
            'messages' => ContactMessage::whereNull('archived_at')->latest()->limit(5)->get(['id', 'name', 'subject', 'created_at', 'read_at'])]);
    }
}
