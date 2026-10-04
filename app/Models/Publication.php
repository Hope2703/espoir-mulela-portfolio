<?php

namespace App\Models;

use App\Models\Concerns\HasTranslations;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Publication extends Model
{
    use HasTranslations;
    use SoftDeletes;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['title' => 'array', 'slug' => 'array', 'excerpt' => 'array', 'seo_title' => 'array', 'seo_description' => 'array', 'body' => 'array', 'published_at' => 'datetime'];
    }
}
