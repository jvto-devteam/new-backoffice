import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import Authenticated from '@/Layouts/Main';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter, Plus, Edit, Trash, X } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function ArticleIndex({ articles, filters }) {
    // State untuk filter artikel
    const [search, setSearch] = useState(filters.search || '');
    const [publishDate, setPublishDate] = useState(filters.publish_date || '');

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
        publish_date: '',
        status: 'draft'
    });

    // Handler untuk submit filter
    const handleFilterSubmit = (e) => {
        e.preventDefault();
        router.get('/dashboard/articles', { search, publish_date: publishDate }, { preserveState: true, preserveScroll: true });
        setIsFilterOpen(false);
    };

    // Handler untuk membuka form tambah artikel
    const openForm = () => {
        setIsFormOpen(true);
        setIsEditing(false);
        setFormData({
            id: null,
            title: '',
            slug: '',
            content: '',
            tags: '',
            publish_date: '',
            status: 'draft'
        });
    };

    // Handler untuk membuka form edit artikel dan mengisi data yang ada
    const openEditForm = (article) => {
        setIsFormOpen(true);
        setIsEditing(true);
        setFormData({
            id: article.id,
            title: article.title,
            slug: article.slug,
            content: article.content,
            tags: article.tags,
            publish_date: article.publish_date,
            status: article.status,
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
        if (isEditing) {
            router.put(`/dashboard/articles/${formData.id}`, formData, {
                onSuccess: () => setIsFormOpen(false),
            });
        } else {
            router.post('/dashboard/articles', formData, {
                onSuccess: () => setIsFormOpen(false),
            });
        }
    };

    // Handler untuk menghapus artikel
    const handleDelete = (articleId) => {
        if (confirm('Are you sure you want to delete this article?')) {
            router.delete(`/dashboard/articles/${articleId}`);
        }
    };

    // Handler untuk pagination
    const handlePageChange = (url) => {
        router.get(url, { search, publish_date: publishDate }, { preserveState: true, preserveScroll: true });
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
                                <TableHead>Tags</TableHead>
                                <TableHead>Publish Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {articles.data.map((article) => (
                                <TableRow key={article.id}>
                                    <TableCell className="font-medium">{article.title}</TableCell>
                                    <TableCell>{article.tags}</TableCell>
                                    <TableCell>{formatDate(article.publish_date)}</TableCell>
                                    <TableCell>{article.status}</TableCell>
                                    <TableCell className="text-center space-x-2">
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
                        <div className="bg-white rounded-lg p-6 w-full max-w-3xl">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">{isEditing ? 'Edit Article' : 'Add Article'}</h2>
                                <Button variant="ghost" size="icon" onClick={closeForm}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                            <form onSubmit={handleFormSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Title</label>
                                        <Input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => handleFormChange('title', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Slug</label>
                                        <Input
                                            type="text"
                                            value={formData.slug}
                                            onChange={(e) => handleFormChange('slug', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Content</label>
                                    <ReactQuill
                                        theme="snow"
                                        value={formData.content}
                                        onChange={(value) => handleFormChange('content', value)}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Tags</label>
                                        <Input
                                            type="text"
                                            placeholder="e.g., tech, news"
                                            value={formData.tags}
                                            onChange={(e) => handleFormChange('tags', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Publish Date</label>
                                        <Input
                                            type="date"
                                            value={formData.publish_date}
                                            onChange={(e) => handleFormChange('publish_date', e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Status</label>
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
                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
                                    <Button type="submit">{isEditing ? 'Update Article' : 'Create Article'}</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Authenticated>
    );
}
