'use client';

import React, { useState, useEffect } from 'react';
import PostDetailView from './postdetailview';

interface Author {
    _id: string;
    username: string;
    email: string;
}

interface Post {
    _id: string;
    title: string;
    content: string;
    status: 'Draft' | 'Published';
    likes: string[];
    commentsCount?: number; // ✅ Added tracking value for live fetched comment counts
    author: Author;
    image?: string;
}

interface AuthorContentProps {
    onEditForward: (post: Post) => void;
    onNewPostClick: () => void;
}

const AuthorContent: React.FC<AuthorContentProps> = ({ onEditForward, onNewPostClick }) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    // Fetch published posts data and their exact comment counts
    const fetchPublishedPosts = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/posts/createpost');
            const data = await response.json();

            if (data && data.post) {
                const basePosts: Post[] = data.post;

                // ✅ Parallel API call loop to target: /api/posts/[id]/commentPost
                const postsWithLiveCommentCounts = await Promise.all(
                    basePosts.map(async (post) => {
                        try {
                            const commRes = await fetch(`/api/posts/${post._id}/commentPost`);
                            const commData = await commRes.json();
                            return {
                                ...post,
                                // Safely hooks into the totalComments or length metrics you added to the API
                                commentsCount: commData.totalComments ?? commData.length ?? 0
                            };
                        } catch (err) {
                            console.error(`Error loading comment count for post ${post._id}:`, err);
                            return { ...post, commentsCount: 0 };
                        }
                    })
                );

                setPosts(postsWithLiveCommentCounts);
            }
        } catch (error) {
            console.error('Error fetching published posts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPublishedPosts();
    }, []);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to permanently delete this published post?')) {
            return;
        }

        try {
            const response = await fetch(`/api/posts/${id}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                setPosts((prevPosts) => prevPosts.filter((post) => post._id !== id));
                alert('🗑️ Published post deleted successfully!');
            } else {
                const errorData = await response.json().catch(() => ({}));
                alert(errorData.error || 'Failed to delete the post. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('A network connection error occurred while trying to delete.');
        }
    };

    if (selectedPost) {
        return (
            <PostDetailView
                post={selectedPost}
                onBack={() => {
                    setSelectedPost(null);
                    fetchPublishedPosts();
                }}
            />
        );
    }

    return (
        <div className="w-full h-full p-4">
            {/* Top Action Section */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-black">Published Articles</h1>
                    <p className="text-gray-600 text-sm">Monitor performance metrics and manage live content.</p>
                </div>
                <button
                    onClick={onNewPostClick}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-5 rounded shadow-sm transition-colors"
                >
                    + Create Post
                </button>
            </div>

            {/* Dashboard Table Container */}
            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                {loading ? (
                    <div className="p-6 text-center text-gray-500 font-medium">Loading published posts...</div>
                ) : posts.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 font-medium">No published posts found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100 border-b border-gray-200 text-gray-700 text-sm font-semibold">
                                    <th className="p-4 w-20 text-black">Post No.</th>
                                    <th className="p-4 text-black">Title</th>
                                    <th className="p-4 text-black">Status</th>
                                    <th className="p-4 text-center text-black">Likes</th>
                                    <th className="p-4 text-center text-black">Comments</th>
                                    <th className="p-4 text-center text-black">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-sm text-black">
                                {posts.map((post, index) => (
                                    <tr
                                        key={post._id}
                                        onClick={() => setSelectedPost(post)}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                                    >
                                        <td className="p-4 font-semibold text-gray-500">{index + 1}</td>
                                        <td className="p-4 font-medium text-gray-900 truncate max-w-xs md:max-w-md">
                                            {post.title}
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 uppercase tracking-wider">
                                                {post.status || 'Published'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center font-semibold text-gray-700">
                                            {post.likes ? post.likes.length : 0}
                                        </td>

                                        {/* ✅ Displays the exact live total comments fetched from your target API */}
                                        <td className="p-4 text-center font-semibold text-blue-600">
                                            {post.commentsCount ?? 0}
                                        </td>

                                        <td className="p-4 text-center space-x-3 whitespace-nowrap">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEditForward(post);
                                                }}
                                                className="text-blue-600 hover:text-blue-800 font-semibold text-sm transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(post._id, e)}
                                                className="text-red-600 hover:text-red-800 font-semibold text-sm transition-colors"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthorContent;
