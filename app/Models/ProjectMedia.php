<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProjectMedia extends Model
{
    protected $guarded = ['id'];

    protected $table = 'project_media';

    protected function casts(): array
    {
        return ['alt' => 'array', 'public_safe' => 'boolean'];
    }

    public function owner()
    {
        return $this->belongsTo(Project::class, 'project_id');
    }
}
