<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\ArticleMedia;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ArticleController extends Controller
{
    /**
     * Tampilkan daftar artikel (listing).
     */
    public function index(Request $request)
    {
        // Contoh: menambahkan fitur pencarian
        $search = $request->input('search');

        // Query dasar
        $query = Article::with('articleMedia')->orderBy('id', 'desc');

        if ($search) {
            // Contoh pencarian sederhana
            $query->where('title', 'like', '%' . $search . '%')
                ->orWhere('content', 'like', '%' . $search . '%');
        }

        // Contoh: pagination
        $articles = $query->paginate(10)->withQueryString();

        // Kirim data ke komponen Inertia/React
        return Inertia::render('Article/Index', [
            'articles' => $articles,
            'filters'  => [
                'search' => $search,
            ],
        ]);
    }

    /**
     * Tampilkan form untuk membuat artikel baru.
     */
    public function create()
    {
        // Tampilkan form pembuatan artikel
        return Inertia::render('Article/Create');
    }

    /**
     * Simpan artikel baru ke database.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'             => 'required|string|max:255',
            'slug'              => 'required|string|max:255|unique:articles,slug',
            'content'           => 'required|string',
            'tags'              => 'nullable|string',
            'published_at'      => 'required|date',
            'status'            => 'required|in:draft,published',
            'author'            => 'nullable|string|max:255',
            'featured_image'    => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'meta_title'        => 'nullable|string|max:255',
            'meta_description'  => 'nullable|string',
            'articleMedia'      => 'nullable|array',
            'articleMedia.*.file'      => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'articleMedia.*.caption'   => 'nullable|string|max:255',
            'articleMedia.*.alt_text'  => 'nullable|string|max:255',
            'articleMedia.*.type'      => 'nullable|string'
        ]);

        DB::beginTransaction();
        try {
            // Simpan featured image jika ada
            if ($request->hasFile('featured_image')) {
                $featuredImagePath = $request->file('featured_image')->store('featured_images', 'public');
                $validated['featured_image'] = $featuredImagePath;
            }

            // Buat record article
            $article = Article::create($validated);

            // Proses article media jika ada
            if (isset($validated['articleMedia']) && is_array($validated['articleMedia'])) {
                foreach ($validated['articleMedia'] as $index => $mediaInput) {
                    // Cek apakah file ada menggunakan index input file yang sesuai
                    if ($request->hasFile("articleMedia.$index.file")) {
                        $mediaFile = $request->file("articleMedia.$index.file");
                        $mediaPath = $mediaFile->store('article_media', 'public');
                        $mediaInput['media_url'] = $mediaPath;
                    }

                    // Set foreign key
                    $mediaInput['article_id'] = $article->id;
                    // Hapus key file karena tidak diperlukan (sudah diunggah)
                    unset($mediaInput['file']);

                    ArticleMedia::create($mediaInput);
                }
            }

            DB::commit();
            return redirect()->route('articles.index')
                ->with('success', 'Article created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors($e->getMessage())->withInput();
        }
    }

    public function show($id)
    {
        $article = Article::with('articleMedia')->findOrFail($id);
//        return $article;
        return Inertia::render('Article/Show', [
            'article' => $article,
        ]);
    }

    /**
     * Tampilkan form edit artikel.
     */
    public function edit(Article $article)
    {
        // Eager load relasi articleMedia
        $article->load('articleMedia');
//        return $article;
        return Inertia::render('Article/Edit', [
            'article' => $article,
        ]);
    }

    /**
     * Update artikel di database.
     */
    public function update(Request $request, $id)
    {
        $article = Article::find($id);
        $validated = $request->validate([
            'title'                 => 'required|string|max:255',
            'slug'                  => 'required|string|max:255|unique:articles,slug,' . $article->id,
            'content'               => 'required|string',
            'tags'                  => 'nullable|string',
            'published_at'          => 'required|date',
            'status'                => 'required|in:draft,published',
            'author'                => 'nullable|string|max:255',
            'featured_image'        => 'nullable',
            'meta_title'            => 'nullable|string|max:255',
            'meta_description'      => 'nullable|string',
            'articleMedia'          => 'nullable|array',
            'articleMedia.*.id'     => 'nullable|integer',
            'articleMedia.*.file'   => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
            'articleMedia.*.caption'=> 'nullable|string|max:255',
            'articleMedia.*.alt_text'=> 'nullable|string|max:255',
            'articleMedia.*.type'   => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            // Jika ada file baru untuk featured_image, unggah dan simpan path-nya
            if ($request->hasFile('featured_image')) {
                $featuredImagePath = $request->file('featured_image')->store('featured_images', 'public');
                $validated['featured_image'] = $featuredImagePath;
            }

            // Update record article
            $article->update($validated);

            // Tangani article media

            // 1. Hapus media yang sudah ada namun tidak dikirim kembali dari form (artinya user menghapusnya)
            $existingMediaIds = $article->articleMedia->pluck('id')->toArray();
            $updatedMediaIds = collect($request->articleMedia)->pluck('id')->filter()->toArray();
            $idsToDelete = array_diff($existingMediaIds, $updatedMediaIds);
            if (!empty($idsToDelete)) {
                \App\Models\ArticleMedia::whereIn('id', $idsToDelete)->delete();
            }

            // 2. Proses setiap entry articleMedia dari form
            if (isset($validated['articleMedia']) && is_array($validated['articleMedia'])) {
                foreach ($request->articleMedia as $index => $mediaInput) {
                    // Jika id ada, berarti ini adalah update terhadap media yang sudah ada
                    if (isset($mediaInput['id'])) {
                        $articleMediaRecord = \App\Models\ArticleMedia::find($mediaInput['id']);
                        // Jika ada file baru untuk media ini, unggah dan set media_url
                        if ($request->hasFile("articleMedia.$index.file")) {
                            $mediaPath = $request->file("articleMedia.$index.file")->store('article_media', 'public');
                            $mediaInput['media_url'] = $mediaPath;
                        }
                        // Hapus key file karena tidak perlu disimpan
                        unset($mediaInput['file']);
                        $articleMediaRecord->update($mediaInput);
                    } else {
                        // Jika id tidak ada, ini media baru yang harus dibuat
                        if ($request->hasFile("articleMedia.$index.file")) {
                            $mediaFile = $request->file("articleMedia.$index.file");
                            $mediaPath = $mediaFile->store('article_media', 'public');
                            $mediaInput['media_url'] = $mediaPath;
                        }
                        unset($mediaInput['file']);
                        $mediaInput['article_id'] = $article->id;
                        \App\Models\ArticleMedia::create($mediaInput);
                    }
                }
            }

            DB::commit();
            return redirect()->route('articles.index')->with('success', 'Article updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors($e->getMessage())->withInput();
        }
    }


    /**
     * Hapus artikel dari database.
     */
    public function destroy(Article $article)
    {
        $article->delete();

        return redirect()->route('articles.index')
            ->with('success', 'Artikel berhasil dihapus.');
    }
}
