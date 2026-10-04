<?php

namespace App\Http\Controllers;

use App\Http\Requests\ContactRequest;
use App\Mail\ContactMessageConfirmation;
use App\Mail\ContactMessageReceived;
use App\Models\ContactMessage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function store(ContactRequest $request)
    {
        if ($request->filled('website')) {
            return back()->with('success', __('ui.contact_success'));
        }
        $message = ContactMessage::create($request->safe()->only(['name', 'email', 'subject', 'message']));
        $recipient = config('portfolio.admin_email');
        if ($recipient) {
            try {
                Mail::to($recipient)->send(new ContactMessageReceived($message));
            } catch (\Throwable $e) {
                Log::warning('Contact notification failed', ['message_id' => $message->id, 'exception' => get_class($e)]);
            }
        }

        if (config('portfolio.send_confirmation')) {
            try {
                Mail::to($message->email)->send(new ContactMessageConfirmation($message));
            } catch (\Throwable $e) {
                Log::warning('Contact confirmation failed', ['message_id' => $message->id, 'exception' => get_class($e)]);
            }
        }

        return back()->with('success', __('ui.contact_success'));
    }
}
