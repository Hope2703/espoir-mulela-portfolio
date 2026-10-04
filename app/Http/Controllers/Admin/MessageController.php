<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MessageController extends Controller
{
    public function index(Request $r)
    {
        $q = ContactMessage::query();
        $filter = $r->query('filter', 'inbox');
        if ($filter === 'archived') {
            $q->whereNotNull('archived_at');
        } else {
            $q->whereNull('archived_at');
        }
        if ($filter === 'unread') {
            $q->whereNull('read_at');
        } if ($filter === 'read') {
            $q->whereNotNull('read_at');
        }

        return Inertia::render('admin/messages', ['items' => $q->latest()->paginate(20)->withQueryString(), 'filter' => $filter, 'message' => null]);
    }

    public function show(int $id)
    {
        $message = ContactMessage::findOrFail($id);
        if (! $message->read_at) {
            $message->update(['read_at' => now()]);
        }

        return Inertia::render('admin/messages', ['items' => null, 'filter' => 'inbox', 'message' => $message]);
    }

    public function destroy(int $id)
    {
        ContactMessage::findOrFail($id)->delete();

        return redirect('/admin/messages')->with('success', __('admin.Message supprimé.'));
    }

    public function update(Request $r, int $id)
    {
        $data = $r->validate(['action' => 'required|in:read,unread,archive,restore']);
        $field = in_array($data['action'], ['read', 'unread']) ? 'read_at' : 'archived_at';
        ContactMessage::findOrFail($id)->update([$field => in_array($data['action'], ['read', 'archive']) ? now() : null]);

        return back()->with('success', __('admin.message.'.$data['action']));
    }
}
