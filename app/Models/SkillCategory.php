<?php

namespace App\Models;

use App\Models\Concerns\HasTranslations;
use Illuminate\Database\Eloquent\Model;

class SkillCategory extends Model
{
    use HasTranslations;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['title' => 'array', 'description' => 'array'];
    }

    public function skills()
    {
        return $this->hasMany(Skill::class)->orderBy('sort_order');
    }
}
