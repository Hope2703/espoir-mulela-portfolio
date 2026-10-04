<!DOCTYPE html>
<html lang="{{ request()->is('en', 'en/*') ? 'en' : 'fr' }}">
<head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex,nofollow"><title>{{ $status }} · Espoir Mulela</title>
    @vite('resources/css/app.css')
</head>
<body>
    <main class="wrap section" style="min-height:100vh;display:flex;flex-direction:column;justify-content:center">
        <p class="eyebrow">{{ $status }} · Espoir Mulela</p>
        <h1>{{ request()->is('en', 'en/*') ? 'Temporarily unavailable' : 'Indisponibilité temporaire' }}</h1>
        <p>{{ request()->is('en', 'en/*') ? 'Please try again in a moment.' : 'Veuillez réessayer dans quelques instants.' }}</p>
        <a href="{{ request()->is('en', 'en/*') ? '/en' : '/' }}">{{ request()->is('en', 'en/*') ? 'Home' : 'Accueil' }}</a>
    </main>
</body>
</html>
