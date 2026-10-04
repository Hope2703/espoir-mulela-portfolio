<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<script>document.documentElement.dataset.motion="ready";</script>
<script>(()=>{let t;try{t=localStorage.getItem('espoir-theme')}catch{}document.documentElement.dataset.theme=(t==='light'||t==='dark')?t:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')})()</script>
<link rel="icon" href="/icon.svg" type="image/svg+xml">
@viteReactRefresh
@vite(['resources/css/app.css','resources/js/app.tsx'])
<x-inertia::head>
@php($meta = $page['props']['meta'] ?? null)
<title>{{ $meta['title'] ?? config('app.name') }}</title>
@if($meta)
<meta name="description" content="{{ $meta['description'] }}"><link rel="canonical" href="{{ $meta['canonical'] }}"><meta name="robots" content="{{ $meta['robots'] }}">
@foreach($meta['alternates'] as $locale => $url)<link rel="alternate" hreflang="{{ $locale }}" href="{{ $url }}">@endforeach
<link rel="alternate" hreflang="x-default" href="{{ $meta['alternates']['fr'] ?? url('/') }}">
<meta property="og:title" content="{{ $meta['title'] }}"><meta property="og:description" content="{{ $meta['description'] }}"><meta property="og:url" content="{{ $meta['canonical'] }}"><meta property="og:image" content="{{ $meta['image'] }}"><meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{{ $meta['title'] }}"><meta name="twitter:description" content="{{ $meta['description'] }}"><meta name="twitter:image" content="{{ $meta['image'] }}">
<script type="application/ld+json">{!! json_encode($meta['jsonLd'], JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) !!}</script>
@else <meta name="robots" content="noindex, nofollow"> @endif
</x-inertia::head></head><body><x-inertia::app /></body></html>