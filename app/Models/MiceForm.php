<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MiceForm extends Model
{
    use HasFactory;

    protected $fillable = ['first_name','last_name','email','company_name','industry','company_website','company_location','attendees','destinations','date','details'];
}
