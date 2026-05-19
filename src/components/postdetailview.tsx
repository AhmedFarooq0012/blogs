'use client';

import React, { useState, useEffect } from 'react';

interface Comment {
    _id: string;
    commentText: string; // ✅ Synced with your exact database API property key
    user: {
        _id: string;
        username: string;
        email: string;
        profilepic?: string;
    };
    createdAt: string;
}

interface PostDetailViewProps {
    post: any;
    onBack: () => void;
}

const PostDetailView: React.FC<PostDetailViewProps> = ({ post, onBack }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loadingComments, setLoadingComments] = useState(true);

    // Fetch live discussion data stream matching your payload layout structure
    useEffect(() => {
        const fetchLiveComments = async () => {
            if (!post?._id) return;
            try {
                setLoadingComments(true);
                const response = await fetch(`/api/posts/${post._id}/commentPost`);
                const data = await response.json();

                if (response.ok && data.comments) {
                    setComments(data.comments);
                }
            } catch (error) {
                console.error('Error fetching comments:', error);
            } finally {
                setLoadingComments(false);
            }
        };

        fetchLiveComments();
    }, [post?._id]);

    if (!post) {
        return (
            <div className="p-6 text-center text-gray-500 font-medium">
                <p>Loading post data safely...</p>
                <button onClick={onBack} className="mt-4 text-blue-600 font-bold underline">Go Back</button>
            </div>
        );
    }

    return (
        <div className="w-full h-full p-4 text-black bg-gray-50 animate-in fade-in duration-200">
            {/* Navigation Header */}
            <button onClick={onBack} className="mb-6 font-bold text-sm text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1">
                ← Back to List View
            </button>

            {/* Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* LEFT VIEWPORT PANEL: Reader Conversation Timeline */}
                <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col h-[600px]">
                    <h2 className="text-lg font-bold border-b border-gray-100 pb-3 flex justify-between items-center text-black">
                        <span>Reader Discussion</span>
                        <span className="text-xs bg-slate-100 text-slate-600 py-0.5 px-2 rounded-full font-semibold">
                            {loadingComments ? '...' : `${comments.length} Total`}
                        </span>
                    </h2>

                    {/* Scrollable Container */}
                    <div className="flex-1 overflow-y-auto my-2 space-y-3 pr-1">
                        {loadingComments ? (
                            <div className="p-6 text-center text-gray-400 text-sm animate-pulse">Loading comments...</div>
                        ) : comments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 py-12">
                                <p className="text-sm">No comments have been posted on this article yet.</p>
                            </div>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment._id} className="p-4 bg-slate-50 rounded-lg border border-slate-100 shadow-sm flex flex-col gap-2">
                                    {/* Line 1: Reader Name & Formatted Date / Time */}
                                    <div className="flex justify-between items-center text-xs">
                                        {/* Dynamic Reader Name */}
                                        <span className="font-extrabold text-blue-900 tracking-tight text-sm">
                                            {comment.user?.username || 'Anonymous Reader'}
                                        </span>
                                        {/* Dynamic Date & Exact Timestamp Time */}
                                        <span className="text-gray-400 font-medium">
                                            {comment.createdAt ? (
                                                `${new Date(comment.createdAt).toLocaleDateString()} at ${new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                                            ) : (
                                                'Recent'
                                            )}
                                        </span>
                                    </div>

                                    {/* Line 2: Comment Content Body Text — ✅ Linked to comment.commentText */}
                                    <div className="bg-white p-2.5 rounded border border-gray-100 mt-1">
                                        <p className="text-gray-800 font-medium text-sm whitespace-pre-wrap break-words">
                                            {comment.commentText || "Empty comment content"}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* RIGHT VIEWPORT PANEL: Article Display Canvas */}
                <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6 overflow-y-auto h-[600px]">
                    {post.image && post.image !== 'example.com' && (
                        <div className="w-full h-56 rounded-lg overflow-hidden border border-gray-100">
                            <img src={post.image} alt={post.title} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        </div>
                    )}

                    <div className="border-b border-gray-100 pb-4">
                        <h1 className="text-2xl lg:text-3xl font-black text-gray-900 leading-tight tracking-tight mb-2">{post.title}</h1>
                        <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mt-3">
                            <span className="flex items-center gap-1 bg-red-50 text-red-700 py-1 px-2.5 rounded-full font-bold">❤️ {post.likes ? post.likes.length : 0} Likes</span>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${post.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{post.status || 'Draft'}</span>
                        </div>
                    </div>

                    <div className="prose max-w-none text-gray-800 leading-relaxed text-sm lg:text-base break-words" dangerouslySetInnerHTML={{ __html: post.content }} />
                </div>

            </div>
        </div>
    );
};

export default PostDetailView;
