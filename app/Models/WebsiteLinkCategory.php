<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WebsiteLinkCategory extends Model
{
    use HasFactory;

    public function websiteLink()
    {
        return $this->hasMany(WebsiteLink::class, 'link_category_id');
    }

}
