"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface Author {
    _id: string;
    username: string;
    email: string;
    profilepic: string;
}

interface Comment {
    _id: string;
    commentText: string;
    user: {
        _id: string;
        username: string;
        profilepic: string;
    };
    createdAt: string;
}
interface Post {
    _id: string;
    title: string;
    content: string;
    image?: string;
    status: string;
    author: Author;
    likes: string[];
    createdAt: string;
}

export default function Contents() {
    const { data: session } = useSession();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});
    const [activeCommentBox, setActiveCommentBox] = useState<string | null>(null);
    const [commentsData, setCommentsData] = useState<Record<string, Comment[]>>({});
    const [loadingComments, setLoadingComments] = useState<Record<string, boolean>>({});
    const [newComments, setNewComments] = useState<Record<string, string>>({});

    // Fetch all published posts
    const fetchPosts = async () => {
        try {
            const res = await fetch("/api/posts/createpost");
            const data = await res.json();
            if (res.ok) {
                setPosts(data.post || []);
            } else {
                toast.error(data.error || "Failed to load posts.");
            }
        } catch (error) {
            console.error("Fetch posts failed:", error);
            toast.error("Network error while loading posts.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    // Like / Unlike toggle handler
    const handleLikeToggle = async (postId: string) => {
        if (!session) {
            toast.error("Please create an account or sign in to like this post.");
            return;
        }
        try {
            const res = await fetch(`/api/posts/${postId}/likespost`, {
                method: "PATCH",
            });
            const data = await res.json();

            if (res.ok) {
                setPosts((prevPosts) =>
                    prevPosts.map((post) => {
                        if (post._id === postId) {
                            const userId = (session?.user as any)?.id;
                            const isLiked = post.likes.includes(userId);
                            return {
                                ...post,
                                likes: isLiked
                                    ? post.likes.filter((id) => id !== userId)
                                    : [...post.likes, userId],
                            };
                        }
                        return post;
                    })
                );
                toast.success(data.message);
            } else {
                toast.error(data.error || "Action unauthorized.");
            }
        } catch (error) {
            toast.error("Failed to process like action.");
        }
    };

    // Lazy load comments section
    const toggleCommentsSection = async (postId: string) => {
        if (activeCommentBox === postId) {
            setActiveCommentBox(null);
            return;
        }
        setActiveCommentBox(postId);

        if (!commentsData[postId]) {
            setLoadingComments((prev) => ({ ...prev, [postId]: true }));
            try {
                const res = await fetch(`/api/posts/${postId}/commentPost`);
                const data = await res.json();
                if (res.ok) {
                    setCommentsData((prev) => ({ ...prev, [postId]: data.comments || [] }));
                }
            } catch (error) {
                console.error("Failed fetching comments:", error);
            } finally {
                setLoadingComments((prev) => ({ ...prev, [postId]: false }));
            }
        }
    };

    // Submit fresh user comment
    const handleCommentSubmit = async (e: React.FormEvent, postId: string) => {
        e.preventDefault();
        const text = newComments[postId]?.trim();
        if (!text) return;

        if (!session) {
            toast.error("Please create an account or sign in to comment on this post.");
            return;
        }

        try {
            const res = await fetch(`/api/posts/${postId}/commentPost`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ commentText: text }),
            });
            const data = await res.json();

            if (res.ok) {
                toast.success("Comment added successfully!");
                setCommentsData((prev) => ({
                    ...prev,
                    [postId]: [data.comment, ...(prev[postId] || [])],
                }));
                setNewComments((prev) => ({ ...prev, [postId]: "" }));
            } else {
                toast.error(data.error || "Failed to post comment.");
            }
        } catch (error) {
            toast.error("Error connecting to server.");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[40vh]">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 w-full max-w-2xl mx-auto">
            {posts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 font-medium">No published articles available yet.</p>
                </div>
            ) : (
                posts.map((post) => {
                    const currentUserId = (session?.user as any)?.id;
                    const hasLiked = post.likes?.includes(currentUserId);
                    const isExpanded = expandedDescriptions[post._id];
                    const isCommentOpen = activeCommentBox === post._id;

                    return (
                        <article key={post._id} className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden transition-shadow duration-200 hover:shadow-md">

                            {/* Header: Author Bio info */}
                            <div className="p-4 flex items-center gap-3">
                                <img
                                    src={post.author?.profilepic || "https://pixabay.com"}
                                    alt={post.author?.username || "Author"}
                                    className="w-10 h-10 rounded-full object-cover border border-gray-100"
                                />
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-sm">{post.author?.username || "Anonymous Writer"}</h3>
                                    <p className="text-xs text-gray-400 font-medium">
                                        {new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                    </p>
                                </div>
                            </div>

                            {/* Dynamic Content Image */}
                            {post.image && (
                                <div className="relative w-full bg-gray-50 border-y border-gray-50">
                                    <img src={post.image} alt={post.title} className="object-cover w-full h-full" />
                                </div>
                            )}

                            {/* Title & Description Body */}
                            <div className="p-5 space-y-3">
                                <h2 className="text-2xl font-serif font-bold tracking-tight text-gray-900 leading-tight">
                                    {post.title}
                                </h2>
                                <div className="text-gray-600 text-sm font-sans leading-relaxed whitespace-pre-line">
                                    {isExpanded ? post.content : `${post.content.slice(0, 160)}...`}
                                    {post.content.length > 160 && (
                                        <button
                                            onClick={() => setExpandedDescriptions((prev) => ({ ...prev, [post._id]: !isExpanded }))}
                                            className="text-blue-600 font-semibold ml-2 hover:underline focus:outline-none"
                                        >
                                            {isExpanded ? "Show Less" : "Read More"}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Interaction Bar Grid Toolbar */}
                            <div className="px-5 py-3 border-t border-gray-50 flex items-center gap-6 text-gray-500">
                                <button
                                    onClick={() => handleLikeToggle(post._id)}
                                    className={`flex items-center gap-2 text-sm font-semibold transition group ${hasLiked ? "text-red-500" : "hover:text-red-500"
                                        }`}
                                >
                                    <span className="text-xl transition-transform duration-100 group-active:scale-120">
                                        {hasLiked ? "❤️" : "🤍"}
                                    </span>
                                    <span>{post.likes?.length || 0} Likes</span>
                                </button>

                                <button
                                    onClick={() => toggleCommentsSection(post._id)}
                                    className={`flex items-center gap-2 text-sm font-semibold hover:text-blue-600 transition ${isCommentOpen ? "text-blue-600" : ""
                                        }`}
                                >
                                    <span className="text-xl">💬</span>
                                    <span>Comments</span>
                                </button>
                            </div>

                            {/* Comment Thread Workspace Container */}
                            {isCommentOpen && (
                                <div className="bg-gray-50/60 border-t border-gray-100 p-5 space-y-4">
                                    {/* Dynamic Add Comment Input Field */}
                                    <form onSubmit={(e) => handleCommentSubmit(e, post._id)} className="flex gap-3">
                                        <input
                                            type="text"
                                            placeholder={session ? "Add your perspective..." : "Please create an account or sign in to comment..."}
                                            disabled={!session}
                                            value={newComments[post._id] || ""}
                                            onChange={(e) => setNewComments((prev) => ({ ...prev, [post._id]: e.target.value }))}
                                            className="flex-1 border border-gray-200 bg-white rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-black disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        />
                                        <button
                                            type="submit"
                                            disabled={!session || !newComments[post._id]?.trim()}
                                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold text-sm px-4 py-2 rounded-lg transition"
                                        >
                                            Post
                                        </button>
                                    </form>

                                    {/* Active Comment Listing Thread */}
                                    <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                                        {loadingComments[post._id] ? (
                                            <p className="text-xs text-gray-400 text-center py-2 animate-pulse">Loading conversation thread...</p>
                                        ) : commentsData[post._id]?.length === 0 ? (
                                            <p className="text-xs text-gray-400 text-center py-2">No comments yet. Start the conversation!</p>
                                        ) : (
                                            commentsData[post._id]?.map((comment) => (
                                                <div key={comment._id} className="flex gap-3 items-start bg-white p-3 rounded-lg border border-gray-100 shadow-2xs">
                                                    <img
                                                        src={comment.user?.profilepic || "https://pixabay.com"}
                                                        alt="User Profile"
                                                        className="w-7 h-7 rounded-full object-cover"
                                                    />
                                                    <div className="space-y-0.5 flex-1">
                                                        <div className="flex justify-between items-center">
                                                            <h4 className="text-xs font-bold text-gray-800">{comment.user?.username || "Reader"}</h4>
                                                            <span className="text-[10px] text-gray-400 font-medium">
                                                                {new Date(comment.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-gray-600 leading-normal font-sans">{comment.commentText}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </article>
                    );
                })
            )}
        </div>
    );
}
