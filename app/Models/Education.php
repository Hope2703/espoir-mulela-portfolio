<?php

namespace App\Models;

use App\Models\Concerns\HasTranslations;
use Illuminate\Database\Eloquent\Model;

class Education extends Model
{
    use HasTranslations;

    protected $guarded = ['id'];

    protected $table = 'education';

    protected function casts(): array
    {
        return ['title' => 'array', 'description' => 'array', 'current' => 'boolean'];
    }
}
