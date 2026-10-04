@extends('mail.layout')
@section('body')
<h1 style="font-size:23px;line-height:1.3">{{ __('mail.verify_heading') }}</h1><p>{{ __('mail.verify_intro') }}</p>@include('mail.button',['url'=>$url,'label'=>__('mail.verify_cta')])<p>{{ __('mail.ignore') }}</p>
@endsection