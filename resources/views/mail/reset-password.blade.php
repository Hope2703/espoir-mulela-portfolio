@extends('mail.layout')
@section('body')
<h1 style="font-size:23px;line-height:1.3">{{ __('mail.reset_heading') }}</h1><p>{{ __('mail.reset_intro') }}</p>@include('mail.button',['url'=>$url,'label'=>__('mail.reset_cta')])<p>{{ __('mail.expires',['minutes'=>$minutes]) }}</p><p>{{ __('mail.ignore') }}</p><p style="font-size:12px;word-break:break-all">{{ __('mail.fallback') }}<br><a href="{{ $url }}" style="color:#17634f">{{ $url }}</a></p>
@endsection