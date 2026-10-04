<?php

namespace App\Models\Concerns;

trait HasTranslations
{
    public function translated(string $field, ?string $locale = null): string
    {
        $value = $this->getAttribute($field);

        return is_array($value) ? ($value[$locale ?? app()->getLocale()] ?? $value['fr'] ?? '') : (string) $value;
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published')->whereNotNull('published_at')->where('published_at', '<=', now());
    }

    public function scopeForSlug($query, string $slug, string $locale)
    {
        return $query->where('slug->'.$locale, $slug);
    }
}
