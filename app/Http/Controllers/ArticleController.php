<?php

namespace App\Http\Controllers;

use App\Models\Article;
use Illuminate\Http\Request;
use Inertia\Inertia;

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
        $query = Article::orderBy('id', 'desc');

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
        // Validasi data
        $validated = $request->validate([
            'title'   => 'required|string|max:255',
            'slug'    => 'required|string|max:255|unique:articles,slug',
            'content' => 'required|string',
            'status'  => 'required|in:draft,published',
            // Tambahkan validasi kolom lain sesuai kebutuhan
        ]);

        // Simpan ke database
        $article = Article::create($validated);

        // Contoh jika ada proses tambahan, seperti upload media dsb
        // ...

        return redirect()->route('articles.index')
            ->with('success', 'Artikel berhasil dibuat.');
    }

    /**
     * Tampilkan detail artikel (jika dibutuhkan).
     */
    public function show(Article $article)
    {
        // Tampilkan satu artikel, jika memang dibutuhkan di dashboard
        // Bisa juga digunakan untuk menampilkan preview
        return Inertia::render('Article/Show', [
            'article' => $article,
        ]);
    }

    /**
     * Tampilkan form edit artikel.
     */
    public function edit(Article $article)
    {
        // Bawa data artikel ke form edit
        return Inertia::render('Article/Edit', [
            'article' => $article,
        ]);
    }

    /**
     * Update artikel di database.
     */
    public function update(Request $request, Article $article)
    {
        // Validasi data
        $validated = $request->validate([
            'title'   => 'required|string|max:255',
            // Pastikan slug unique kecuali untuk artikel ini
            'slug'    => 'required|string|max:255|unique:articles,slug,' . $article->id,
            'content' => 'required|string',
            'status'  => 'required|in:draft,published',
            // Tambahkan validasi kolom lain sesuai kebutuhan
        ]);

        // Update di database
        $article->update($validated);

        // Contoh jika ada proses tambahan (misalnya update media)
        // ...

        return redirect()->route('articles.index')
            ->with('success', 'Artikel berhasil diupdate.');
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
