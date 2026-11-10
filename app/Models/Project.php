<?php

namespace App\Models;

use App\Models\Concerns\HasTranslations;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use HasTranslations;
    use SoftDeletes;

    public const INSTITUTIONAL_KEY = 'institutionnel';

    public const INSTITUTIONAL_SLUG = 'projet-institutionnel';

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['title' => 'array', 'slug' => 'array', 'excerpt' => 'array', 'description' => 'array', 'seo_title' => 'array', 'seo_description' => 'array', 'context' => 'array', 'role' => 'array', 'published_at' => 'datetime', 'featured' => 'boolean', 'confidential' => 'boolean'];
    }

    public function isInstitutional(): bool
    {
        return $this->content_key === self::INSTITUTIONAL_KEY || in_array(self::INSTITUTIONAL_SLUG, $this->slug ?? [], true);
    }

    public function hasConfidentialDetails(): bool
    {
        return $this->confidential || $this->isInstitutional();
    }

    public function scopeWithConfidentialDetails(Builder $query): Builder
    {
        return $query->where(fn (Builder $q) => $q->where('confidential', true)
            ->orWhere('content_key', self::INSTITUTIONAL_KEY)
            ->orWhere('slug->fr', self::INSTITUTIONAL_SLUG)
            ->orWhere('slug->en', self::INSTITUTIONAL_SLUG));
    }

    public function media()
    {
        return $this->hasMany(ProjectMedia::class)->orderByRaw("CASE WHEN type = 'cover' THEN 0 ELSE 1 END")->orderBy('sort_order')->orderBy('id');
    }
}
