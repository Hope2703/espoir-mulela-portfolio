<?php

namespace App\Models;

use App\Models\Concerns\HasTranslations;
use Illuminate\Database\Eloquent\Model;

class Experience extends Model
{
    use HasTranslations;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['title' => 'array', 'description' => 'array', 'public_description' => 'array', 'role' => 'array', 'contributions' => 'array', 'current' => 'boolean', 'confidential' => 'boolean'];
    }

    public function hasConfidentialDetails(): bool
    {
        return $this->isTaprinella() || (bool) $this->confidential;
    }

    public function isTaprinella(): bool
    {
        return in_array(mb_strtolower(trim($this->organization ?? '')), config('portfolio.taprinella_experience_organizations'), true);
    }

    public static function approvedTaprinellaResponsibilities(): array
    {
        return [
            'fr' => __('confidential.taprinella_public_description', [], 'fr'),
            'en' => __('confidential.taprinella_public_description', [], 'en'),
        ];
    }
}
