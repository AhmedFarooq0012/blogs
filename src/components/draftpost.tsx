'use client';

import React, { useState, useEffect } from 'react';
import PostDetailView from './postdetailview';

interface Author {
    _id: string;
    username: string;
    email: string;
}

interface Comment {
    _id: string;
    text: string;
    user: {
        username: string;
        profilepic?: string;
    };
    createdAt: string;
}

interface Post {
    _id: string;
    title: string;
    content: string;
    status: 'Draft' | 'Published';
    likes: string[];
    comments?: Comment[];
    author: Author;
    image?: string;
}

// 1. Explicitly define the props interface expected by the parent container layout
interface DraftPostProps {
    onEditForward: (post: Post) => void;
}

// 2. Add the proper functional React type definition destructurer
const DraftPost: React.FC<DraftPostProps> = ({ onEditForward }) => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);

    const fetchDraftPosts = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/posts/draftposts');
            const data = await response.json();
            if (data && data.post) {
                setPosts(data.post);
            }
        } catch (error) {
            console.error('Error fetching draft posts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDraftPosts();
    }, []);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to permanently delete this draft post?')) {
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
                alert('🗑️ Post deleted successfully!');
            } else {
                const errorData = await response.json().catch(() => ({}));
                alert(errorData.message || 'Failed to delete the post.');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('A network connection error occurred.');
        }
    };

    if (selectedPost) {
        return (
            <PostDetailView
                post={selectedPost}
                onBack={() => {
                    setSelectedPost(null);
                    fetchDraftPosts();
                }}
            />
        );
    }

    return (
        <div className="w-full h-full p-4">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-black">Draft Documents</h1>
                <p className="text-gray-600 text-sm">Review, complete, and publish your saved entries.</p>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
                {loading ? (
                    <div className="p-6 text-center text-gray-500 font-medium">Loading draft posts...</div>
                ) : posts.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 font-medium">No draft posts found.</div>
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
                                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 uppercase tracking-wider">
                                                {post.status || 'Draft'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center font-semibold text-gray-700">
                                            {post.likes ? post.likes.length : 0}
                                        </td>
                                        <td className="p-4 text-center font-semibold text-gray-700">
                                            {post.comments ? post.comments.length : 0}
                                        </td>
                                        <td className="p-4 text-center space-x-3 whitespace-nowrap">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEditForward(post); // ✅ Triggers edit workflow flawlessly
                                                }}
                                                className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(post._id, e)}
                                                className="text-red-600 hover:text-red-800 font-semibold text-sm"
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

export default DraftPost;
