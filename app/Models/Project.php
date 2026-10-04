<?php

namespace App\Models;

use App\Models\Concerns\HasTranslations;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    use HasTranslations;
    use SoftDeletes;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['title' => 'array', 'slug' => 'array', 'excerpt' => 'array', 'description' => 'array', 'seo_title' => 'array', 'seo_description' => 'array', 'context' => 'array', 'role' => 'array', 'published_at' => 'datetime', 'featured' => 'boolean', 'confidential' => 'boolean'];
    }

    public function media()
    {
        return $this->hasMany(ProjectMedia::class)->orderByRaw("CASE WHEN type = 'cover' THEN 0 ELSE 1 END")->orderBy('sort_order')->orderBy('id');
    }
}
