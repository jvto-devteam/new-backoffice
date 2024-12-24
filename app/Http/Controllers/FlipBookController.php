<?php

namespace App\Http\Controllers;

use App\Models\Flipbook;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class FlipBookController extends Controller
{
    function index(){
        $data['flipbook'] = Flipbook::orderBy('id','desc')->get();
        return Inertia::render('FlipBook/Index',['data' => $data]);
    }
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:300',
            'pdf' => 'required|mimes:pdf|max:20480', // Max 20MB
            'slug' => 'required|string|unique:flipbooks,slug'
        ]);

        try {
            // Handle PDF Upload
            $pdfName = null;
            if ($request->hasFile('pdf')) {
                $pdfFile = $request->file('pdf');
                $pdfName = Str::random(40) . '.' . $pdfFile->getClientOriginalExtension();
                Storage::disk('public')->putFileAs('flipbooks/pdf', $pdfFile, $pdfName);
            }

            // Handle Thumbnail Upload
            $thumbnailName = null;
            if ($request->hasFile('thumbnail')) {
                $thumbnailFile = $request->file('thumbnail');
                $thumbnailName = Str::random(40) . '.' . $thumbnailFile->getClientOriginalExtension();
                Storage::disk('public')->putFileAs('flipbooks/thumbnails', $thumbnailFile, $thumbnailName);
            }

            // Create Flipbook
            $flipbook = Flipbook::create([
                'title' => $request->title,
                'description' => $request->description,
                'thumbnail' => $thumbnailName,
                'pdf' => $pdfName,
                'slug' => $request->slug
            ]);

            return redirect()->back()->with('message', 'Flipbook created successfully!');

        } catch (\Exception $e) {
            // If something goes wrong, delete uploaded files if they exist
            if ($pdfName && Storage::disk('public')->exists('flipbooks/pdf/' . $pdfName)) {
                Storage::disk('public')->delete('flipbooks/pdf/' . $pdfName);
            }
            if ($thumbnailName && Storage::disk('public')->exists('flipbooks/thumbnails/' . $thumbnailName)) {
                Storage::disk('public')->delete('flipbooks/thumbnails/' . $thumbnailName);
            }

            return redirect()->back()
                ->withErrors(['error' => 'An error occurred while creating the flipbook.'])
                ->withInput();
        }
    }

    public function update(Request $request, $id)
    {
        $flipbook = Flipbook::findOrFail($id);
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:300',
            'pdf' => 'nullable|mimes:pdf|max:20480', // Max 10MB
            'slug' => 'required|string|unique:flipbooks,slug,' . $flipbook->id
        ]);

        try {
            $data = [
                'title' => $request->title,
                'description' => $request->description,
                'slug' => $request->slug
            ];

            // Handle PDF Upload
            if ($request->hasFile('pdf')) {
                // Delete old PDF if exists
                if ($flipbook->pdf && Storage::disk('public')->exists('flipbooks/pdf/' . $flipbook->pdf)) {
                    Storage::disk('public')->delete('flipbooks/pdf/' . $flipbook->pdf);
                }

                $pdfFile = $request->file('pdf');
                $pdfName = Str::random(40) . '.' . $pdfFile->getClientOriginalExtension();
                Storage::disk('public')->putFileAs('flipbooks/pdf', $pdfFile, $pdfName);
                $data['pdf'] = $pdfName;
            }

            // Handle Thumbnail Upload
            if ($request->hasFile('thumbnail')) {
                // Delete old thumbnail if exists
                if ($flipbook->thumbnail && Storage::disk('public')->exists('flipbooks/thumbnails/' . $flipbook->thumbnail)) {
                    Storage::disk('public')->delete('flipbooks/thumbnails/' . $flipbook->thumbnail);
                }

                $thumbnailFile = $request->file('thumbnail');
                $thumbnailName = Str::random(40) . '.' . $thumbnailFile->getClientOriginalExtension();
                Storage::disk('public')->putFileAs('flipbooks/thumbnails', $thumbnailFile, $thumbnailName);
                $data['thumbnail'] = $thumbnailName;
            }

            $flipbook->update($data);

            return redirect()->back()->with('message', 'Flipbook updated successfully!');

        } catch (\Exception $e) {
            return redirect()->back()
                ->withErrors(['error' => 'An error occurred while updating the flipbook.'])
                ->withInput();
        }
    }

    public function destroy($id)
    {
        try {
            $flipbook = Flipbook::findOrFail($id);
            // Delete PDF file
            if ($flipbook->pdf && Storage::disk('public')->exists('flipbooks/pdf/' . $flipbook->pdf)) {
                Storage::disk('public')->delete('flipbooks/pdf/' . $flipbook->pdf);
            }

            // Delete thumbnail
            if ($flipbook->thumbnail && Storage::disk('public')->exists('flipbooks/thumbnails/' . $flipbook->thumbnail)) {
                Storage::disk('public')->delete('flipbooks/thumbnails/' . $flipbook->thumbnail);
            }

            $flipbook->delete();

            return redirect()->back()->with('message', 'Flipbook deleted successfully!');
            
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => 'An error occurred while deleting the flipbook.']);
        }
    }    
}
