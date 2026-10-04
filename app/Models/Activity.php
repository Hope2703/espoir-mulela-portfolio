<?php

namespace App\Models;

use App\Models\Concerns\HasTranslations;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Activity extends Model
{
    use HasTranslations;
    use SoftDeletes;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['title' => 'array', 'slug' => 'array', 'summary' => 'array', 'description' => 'array', 'role' => 'array', 'location' => 'array', 'event_date' => 'date', 'published_at' => 'datetime'];
    }

    public function media()
    {
        return $this->hasMany(ActivityMedia::class)->orderBy('sort_order')->orderBy('id');
    }
}
