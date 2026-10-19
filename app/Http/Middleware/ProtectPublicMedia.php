<?php

namespace App\Http\Middleware;

use App\Models\Project;
use App\Models\ProjectMedia;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProtectPublicMedia
{
    public function handle(Request $request, Closure $next)
    {
        $path = preg_replace('~/+~', '/', $request->decodedPath());
        $storage = str_starts_with(strtolower($path), 'storage/');
        if (! $storage && ! str_starts_with(strtolower($path), 'images/projects/')) {
            return $next($request);
        }

        abort_unless($request->isMethod('GET') || $request->isMethod('HEAD'), 404);
        abort_if(str_contains($path, '\\') || str_contains($path, "\0") || preg_match('~(^|/)\.~', $path), 404);
        $relative = $storage ? substr($path, 8) : $path;
        // The original source copy must remain private even if its media row is removed.
        abort_if(str_starts_with(mb_strtolower($relative), 'images/projects/fomin/'), 404);
        $confidentialProjectIds = Project::withTrashed()->where('confidential', true)->select('id');
        abort_if(ProjectMedia::whereRaw('LOWER(path) = ?', [mb_strtolower($relative)])->whereIn('project_id', $confidentialProjectIds)->exists(), 404);

        $root = realpath($storage ? Storage::disk('public')->path('') : public_path());
        $file = $root ? realpath($root.DIRECTORY_SEPARATOR.$relative) : false;
        abort_unless($root && $file && is_file($file) && str_starts_with($file, $root.DIRECTORY_SEPARATOR), 404);

        return response()->file($file, ['Cache-Control' => 'private, no-store', 'X-Content-Type-Options' => 'nosniff']);
    }
}
