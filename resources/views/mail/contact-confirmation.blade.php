@extends('mail.layout')
@section('title', __('mail.confirmation_subject'))
@section('body')
<h1 style="font-size:23px;line-height:1.3;margin:0 0 20px">{{ __('mail.hello') }} {{ $contact->name }},</h1>
<p>{{ __('mail.received') }}</p><p>{{ __('mail.thanks') }}</p>
<p style="padding:16px;background-color:#f3f5ef"><strong>{{ __('mail.summary') }}</strong><br>{{ $contact->subject }}</p>
<p>Espoir Mulela</p>
@endsection