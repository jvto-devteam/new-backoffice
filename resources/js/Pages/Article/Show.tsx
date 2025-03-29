import React from 'react';
import { Head, Link } from '@inertiajs/react';
import Authenticated from '@/Layouts/Main';

export default function Show({ article }) {
    return (
        <Authenticated>
            <Head title={`Detail Article: ${article.title}`} />
            <div className="p-6 space-y-6">
                <div className="mb-4">
                    <Link href="/articles" className="text-blue-600 hover:underline">
                        &larr; Back to Articles
                    </Link>
                </div>
                <h1 className="text-3xl font-bold">{article.title}</h1>
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Featured Image sebagai gambar utama */}
                    {article.featured_image && (
                        <div className="w-full md:w-2/3">
                            <img
                                src={`/storage/${article.featured_image}`}
                                alt="Featured"
                                className="w-full h-auto object-cover rounded"
                            />
                        </div>
                    )}
                    <div className="w-full md:w-1/3">
                        <div className="space-y-2">
                            <p className="text-gray-500"><strong>Slug:</strong> {article.slug}</p>
                            <p className="text-gray-500">
                                <strong>Created At:</strong> {new Date(article.created_at).toLocaleDateString()}
                            </p>
                            <p className="text-gray-500"><strong>Author:</strong> {article.author}</p>
                            <p className="text-gray-500"><strong>Status:</strong> {article.status}</p>
                            <p className="text-gray-500"><strong>Tags:</strong> {article.tags}</p>
                        </div>
                    </div>
                </div>
                <div>
                    <h2 className="text-2xl font-semibold mb-2">Content</h2>
                    <div dangerouslySetInnerHTML={{ __html: article.content }} />
                </div>
                {/* Galeri untuk Article Media */}
                {/*{article.article_media && article.article_media.length > 0 && (*/}
                {/*    <div className="mt-6">*/}
                {/*        <h2 className="text-2xl font-semibold mb-4">Gallery</h2>*/}
                {/*        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">*/}
                {/*            {article.article_media.map((media) => (*/}
                {/*                <div key={media.id} className="border rounded overflow-hidden">*/}
                {/*                    <img*/}
                {/*                        src={`/storage/${media.media_url}`}*/}
                {/*                        alt={media.caption || 'Article Media'}*/}
                {/*                        className="w-full h-48 object-cover"*/}
                {/*                    />*/}
                {/*                    {media.caption && (*/}
                {/*                        <div className="p-2">*/}
                {/*                            <p className="text-sm text-gray-600">{media.caption}</p>*/}
                {/*                        </div>*/}
                {/*                    )}*/}
                {/*                </div>*/}
                {/*            ))}*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*)}*/}
            </div>
        </Authenticated>
    );
}
