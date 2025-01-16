<?php

namespace App\Http\Controllers;

use App\Models\Link;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShortLinkController extends Controller
{
    function index(){
        $data['link'] = Link::select('id','title','short_url','file','description','thumbnail')->orderBy('id','desc')->get();
        $data['new_short_url'] = \Str::random(8);        
        return Inertia::render('ShortLink/Index',['data' => $data]);
    }
    public function store(Request $request)
    {
        // Validate the request
        $request->validate([
            'title' => 'required|string|max:255',
            'url' => 'required|string|max:255',
            'short_url' => 'required|string|unique:links,short_url|max:20',
            'description' => 'nullable|string',
            'thumbnail' => 'nullable|image|max:2048' // max 2MB            
        ]);
        
        $thumbnailName = null;
        if ($request->hasFile('thumbnail')) {
            $thumbnailFile = $request->file('thumbnail');
            $thumbnailName = \Str::random(40) . '.' . $thumbnailFile->getClientOriginalExtension();
            \Storage::disk('public')->putFileAs('shortlinks/thumbnails', $thumbnailFile, $thumbnailName);
        }

        // Create new link
        Link::create([
            'title' => $request->title,
            'file' => $request->url,
            'short_url' => $request->short_url,
            'description' => $request->description,
            'thumbnail' => $thumbnailName,            
            'type' => 'link' // link or file
        ]);

        return redirect()->back()->with('message', 'Short link created successfully!');
    }    
    
    public function destroy($id)
    {
        $link = Link::findOrFail($id);
        if ($link->thumbnail) {
            \Storage::disk('public')->delete('shortlinks/thumbnails/'.$link->thumbnail);
        }        
        $link->delete();

        return redirect()->back()->with('message', 'Short link deleted successfully!');
    }    

    public function update(Request $request, $id)
    {
        $link = Link::findOrFail($id);
        
        $request->validate([
            'title' => 'required|string|max:255',
            'url' => 'required|string|max:255',
            'short_url' => 'required|string|max:20|unique:links,short_url,'.$id,
            'description' => 'nullable|string',
            'thumbnail' => 'nullable|image|max:300'            
        ]);
   
        $data = [
            'title' => $request->title,
            'file' => $request->url,
            'short_url' => $request->short_url,
            'description' => $request->description,
        ];        

        if ($request->hasFile('thumbnail')) {
            // Delete old thumbnail if exists
            if ($link->thumbnail) {
                \Storage::disk('public')->delete('shortlinks/thumbnails/'.$link->thumbnail);
            }
            $thumbnailFile = $request->file('thumbnail');
            $thumbnailName = \Str::random(40) . '.' . $thumbnailFile->getClientOriginalExtension();
            \Storage::disk('public')->putFileAs('shortlinks/thumbnails', $thumbnailFile, $thumbnailName);

            $data['thumbnail'] = $thumbnailName;
        }

        $link->update($data);
    
        return redirect()->back()->with('message', 'Short link updated successfully!');
    }    
}
