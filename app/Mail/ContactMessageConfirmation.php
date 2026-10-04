<?php

namespace App\Mail;

use App\Models\ContactMessage;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class ContactMessageConfirmation extends Mailable
{
    public function __construct(public ContactMessage $contact) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: __('mail.confirmation_subject'));
    }

    public function content(): Content
    {
        return new Content(view: 'mail.contact-confirmation');
    }
}
