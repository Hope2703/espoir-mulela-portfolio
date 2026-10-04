@extends('mail.layout')
@section('title', __('mail.contact_subject'))
@section('body')
<h1 style="font-size:23px;line-height:1.3;margin:0 0 24px">{{ __('mail.contact_heading') }}</h1>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size:15px;line-height:1.6">
@foreach([__('mail.name')=>$contact->name,__('mail.email')=>$contact->email,__('mail.subject')=>$contact->subject,__('mail.date')=>$contact->created_at->format('d/m/Y H:i').' · Africa/Kinshasa'] as $label=>$value)
<tr><td style="padding:8px 10px 8px 0;color:#536258;vertical-align:top;width:80px">{{ $label }}</td><td style="padding:8px 0;vertical-align:top">{{ $value }}</td></tr>
@endforeach</table>
<h2 style="font-size:18px;margin:24px 0 10px">{{ __('mail.message') }}</h2>
<div style="padding:18px;background-color:#f3f5ef;border-left:3px solid #17634f;line-height:1.7">{!! nl2br(e($contact->message)) !!}</div>
@include('mail.button',['url'=>url('/admin/messages/'.$contact->id),'label'=>__('mail.dashboard')])
@endsection