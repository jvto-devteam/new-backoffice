import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import Authenticated from '@/Layouts/Main';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, Plus, Edit, Trash, X, Eye } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function ArticleIndex({ articles, filters }) {
    // State untuk filter artikel
    const [search, setSearch] = useState(filters.search || '');
    const [publishDate, setPublishDate] = useState(filters.published_at || '');

    // State untuk toggle filter dropdown
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // State untuk modal form (buat dan edit artikel)
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        title: '',
        slug: '',
        content: '',
        tags: '',
        published_at: '',
        status: 'published',
        author: '',
        featured_image: '',
        meta_title: '',
        meta_description: '',
        articleMedia: []
    });

    // Handler untuk submit filter
    const handleFilterSubmit = (e) => {
        e.preventDefault();
        router.get('/articles', { search, published_at: publishDate }, { preserveState: true, preserveScroll: true });
        setIsFilterOpen(false);
    };

    // Handler untuk membuka form tambah artikel
    // Saat membuka form baru, inisialisasi field tambahan dan articleMedia sebagai array kosong
    const openForm = () => {
        const today = new Date().toISOString().split('T')[0]; // format YYYY-MM-DD
        setIsFormOpen(true);
        setIsEditing(false);
        setFormData({
            id: null,
            title: '',
            slug: '',
            content: '',
            tags: '',
            published_at: today,
            status: 'published',
            author: '',
            featured_image: null,
            meta_title: '',
            meta_description: '',
            articleMedia: []
        });
    };

// Fungsi untuk menambah satu entry article media
    const addMedia = () => {
        setFormData(prev => ({
            ...prev,
            articleMedia: [...(prev.articleMedia || []), { file: null, caption: '', alt_text: '', type: 'image' }]
        }));
    };

// Fungsi untuk menghapus entry article media berdasarkan index
    const removeMedia = (index) => {
        setFormData(prev => {
            const newMedia = [...prev.articleMedia];
            newMedia.splice(index, 1);
            return { ...prev, articleMedia: newMedia };
        });
    };

// Fungsi untuk menangani perubahan input pada setiap article media
    const handleMediaChange = (index, key, value) => {
        setFormData(prev => {
            const newMedia = [...prev.articleMedia];
            newMedia[index] = { ...newMedia[index], [key]: value };
            return { ...prev, articleMedia: newMedia };
        });
    };


    // Handler untuk membuka form edit artikel dan mengisi data yang ada
    const openEditForm = (article) => {

        setIsFormOpen(true);
        setIsEditing(true);

        // Konversi tags dari JSON ke comma-separated string
        let tagsValue = '';
        try {
            const parsed = JSON.parse(article.tags);
            if (Array.isArray(parsed)) {
                tagsValue = parsed.join(', ');
            } else {
                tagsValue = article.tags;
            }
        } catch (e) {
            tagsValue = article.tags;
        }

        // Mapping article_media dari backend menjadi articleMedia untuk state form
        const articleMedia = (article.article_media || []).map((media) => ({
            media_url: media.media_url || '',
            caption: media.caption || '',
            alt_text: media.alt_text || '',
            type: media.type || 'image',
        }));

        setFormData({
            id: article.id,
            title: article.title,
            slug: article.slug,
            content: article.content,
            tags: tagsValue,
            published_at: article.published_at, // perhatikan nama field published_at
            status: article.status,
            author: article.author,
            featured_image: article.featured_image,
            meta_title: article.meta_title,
            meta_description: article.meta_description,
            articleMedia: articleMedia, // gunakan key articleMedia untuk state form
        });
    };

    // Tutup form modal
    const closeForm = () => {
        setIsFormOpen(false);
    };

    // Handler perubahan input pada form
    const handleFormChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    // Submit form (create atau update artikel)
    const handleFormSubmit = (e) => {
        e.preventDefault();
        console.log('Submitting form with data:', formData); // Debug: cek payload sebelum dikirim
        if (isEditing) {
            router.put(`/articles/${formData.id}`, formData, {
                onSuccess: () => {
                    closeForm();
                },
                preserveState: true,
                preserveScroll: true,
            });
        } else {
            router.post('/articles', formData, {
                onSuccess: () => {
                    closeForm();
                },
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    // Handler untuk menghapus artikel
    const handleDelete = (articleId) => {
        if (confirm('Are you sure you want to delete this article?')) {
            router.delete(`/articles/${articleId}`);
        }
    };

    // Handler untuk pagination
    const handlePageChange = (url) => {
        router.get(url, { search, published_at: publishDate }, { preserveState: true, preserveScroll: true });
    };

    // Fungsi format tanggal agar lebih mudah dibaca
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <Authenticated>
            <Head title="CMS Articles" />
            <div className="p-6 space-y-6 bg-white rounded-xl">
                {/* Header dan tombol action */}
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">CMS Article Management</h1>
                    <div className="flex gap-2">
                        <Button onClick={openForm} className="gap-2" variant="outline">
                            <Plus className="h-4 w-4" />
                            Add Article
                        </Button>
                        <Button onClick={() => setIsFilterOpen(!isFilterOpen)} variant="outline" className="gap-2">
                            <Filter className="h-4 w-4" />
                            Filters
                        </Button>
                    </div>
                </div>

                {/* Filter Dropdown */}
                {isFilterOpen && (
                    <div className="bg-gray-50 p-4 rounded-lg shadow-md">
                        <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Input
                                type="text"
                                placeholder="Search title, content or tags..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Input
                                type="date"
                                placeholder="Publish Date"
                                value={publishDate}
                                onChange={(e) => setPublishDate(e.target.value)}
                            />
                            <div className="flex items-end">
                                <Button type="submit">Apply Filters</Button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Tabel daftar artikel */}
                <div className="rounded-md border bg-white">
                    <Table>
                        <TableHeader className="bg-gray-100">
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead>Author</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Featured Image</TableHead>
                                <TableHead>Tags</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {articles.data.map((article) => (
                                <TableRow key={article.id}>
                                    <TableCell>{article.title}</TableCell>
                                    <TableCell>{article.slug}</TableCell>
                                    <TableCell>{formatDate(article.created_at)}</TableCell>
                                    <TableCell>{article.author}</TableCell>
                                    <TableCell>{article.status}</TableCell>
                                    <TableCell>
                                        {article.featured_image ? (
                                            <img
                                                src={`/storage/${article.featured_image}`}
                                                alt="Featured"
                                                className="max-w-[80px] object-cover"
                                            />
                                        ) : '-'}
                                    </TableCell>
                                    <TableCell>{article.tags}</TableCell>
                                    <TableCell className="text-center space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => router.get(`/articles/${article.id}`)}>
                                            {/* Menggunakan icon Eye dari lucide-react untuk tombol Detail */}
                                            <Eye className="w-4 h-4" />
                                        </Button>

                                        <Button variant="ghost" size="icon" onClick={() => openEditForm(article)}>
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(article.id)}>
                                            <Trash className="w-4 h-4" />
                                        </Button>

                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {articles.links && articles.links.length > 3 && (
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-500">
                            Showing {articles.from} to {articles.to} of {articles.total} results
                        </div>
                        <div className="flex gap-2">
                            {articles.links.map((link, i) => {
                                if (!link.url && (i === 0 || i === articles.links.length - 1)) return null;
                                return (
                                    <button
                                        key={i}
                                        onClick={() => link.url && handlePageChange(link.url)}
                                        disabled={!link.url}
                                        className={`px-3 py-1 rounded border ${link.active ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Modal Form untuk Tambah/Edit Artikel */}
                {isFormOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">
                                    {isEditing ? 'Edit Article' : 'Add Article'}
                                </h2>
                                <Button variant="ghost" size="icon" onClick={closeForm}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            <form onSubmit={handleFormSubmit} className="space-y-4">
                                {/* Title dan Slug */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Title
                                        </label>
                                        <Input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => handleFormChange('title', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Slug
                                        </label>
                                        <Input
                                            type="text"
                                            value={formData.slug}
                                            onChange={(e) => handleFormChange('slug', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                {/* Input Author */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Author
                                    </label>
                                    <Input
                                        type="text"
                                        value={formData.author}
                                        onChange={(e) => handleFormChange('author', e.target.value)}
                                    />
                                </div>
                                {/* Featured Image */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Featured Image
                                    </label>
                                    <Input
                                        type="file"
                                        onChange={(e) =>
                                            handleFormChange('featured_image', e.target.files[0])
                                        }
                                    />
                                    {/* Jika featured_image sudah ada (edit), tampilkan preview */}
                                    {formData.featured_image &&
                                        typeof formData.featured_image === 'string' && (
                                            <div className="mt-2">
                                                <img
                                                    src={`/storage/${formData.featured_image}`}
                                                    alt="Featured"
                                                    className="max-w-xs"
                                                />
                                            </div>
                                        )}
                                </div>
                                {/* Content */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Content
                                    </label>
                                    <ReactQuill
                                        theme="snow"
                                        value={formData.content}
                                        onChange={(value) => handleFormChange('content', value)}
                                    />
                                </div>
                                {/* Meta Title & Meta Description */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Meta Title
                                        </label>
                                        <Input
                                            type="text"
                                            value={formData.meta_title}
                                            onChange={(e) => handleFormChange('meta_title', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Meta Description
                                        </label>
                                        <Input
                                            type="text"
                                            value={formData.meta_description}
                                            onChange={(e) =>
                                                handleFormChange('meta_description', e.target.value)
                                            }
                                        />
                                    </div>
                                </div>
                                {/* Tags, Publish Date, dan Status */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Tags
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="e.g., tech, news"
                                            value={formData.tags}
                                            onChange={(e) => handleFormChange('tags', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Publish Date
                                        </label>
                                        <Input
                                            type="date"
                                            value={formData.published_at}
                                            onChange={(e) =>
                                                handleFormChange('published_at', e.target.value)
                                            }
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Status
                                        </label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => handleFormChange('status', e.target.value)}
                                            className="mt-1 block w-full border-gray-300 rounded-md"
                                        >
                                            <option value="draft">Draft</option>
                                            <option value="published">Published</option>
                                        </select>
                                    </div>
                                </div>
                                {/* Dynamic Input untuk Article Media */}
                                {/* Dynamic Input untuk Article Media */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Article Media
                                    </label>
                                    {formData.articleMedia &&
                                        formData.articleMedia.map((media, index) => (
                                            <div key={index} className="border p-4 mb-4 rounded">
                                                {media.media_url && (
                                                    <div className="mb-2">
                                                        <img
                                                            src={`/storage/${media.media_url}`}
                                                            alt={media.caption || 'Article Media'}
                                                            className="max-w-xs"
                                                        />
                                                    </div>
                                                )}
                                                <div className="mb-2">
                                                    <label className="block text-sm font-medium text-gray-700">Upload Image</label>
                                                    <Input
                                                        type="file"
                                                        onChange={(e) => handleMediaChange(index, 'file', e.target.files[0])}
                                                    />
                                                </div>
                                                <div className="mb-2">
                                                    <label className="block text-sm font-medium text-gray-700">Caption</label>
                                                    <Input
                                                        type="text"
                                                        value={media.caption || ''}
                                                        onChange={(e) => handleMediaChange(index, 'caption', e.target.value)}
                                                    />
                                                </div>
                                                <div className="mb-2">
                                                    <label className="block text-sm font-medium text-gray-700">Alt Text</label>
                                                    <Input
                                                        type="text"
                                                        value={media.alt_text || ''}
                                                        onChange={(e) => handleMediaChange(index, 'alt_text', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <Button type="button" variant="outline" onClick={() => removeMedia(index)}>
                                                        Remove Media
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    }

                                    <Button type="button" onClick={addMedia}>
                                        Add Media
                                    </Button>

                                </div>


                                {/* Tombol Submit & Cancel */}
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={closeForm}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">
                                        {isEditing ? 'Update Article' : 'Create Article'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}



            </div>
        </Authenticated>
    );
}
