"use client";
import React from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

interface SidebarProps {
    // 1. Extend the interface to handle Author state views alongside Readers
    activeView?: "blogs" | "profile" | "published" | "drafts" | "create";
    setActiveView?: (view: "blogs" | "profile" | "published" | "drafts" | "create") => void;
}

export default function Sidebar({ activeView = "published", setActiveView }: SidebarProps) {
    const { data: session, status } = useSession();
    const isLoading = status === "loading";

    if (isLoading) {
        return (
            <aside className="w-64 bg-slate-900 text-white min-h-screen p-6 flex flex-col items-center justify-center">
                <span className="text-sm text-slate-400 animate-pulse">Loading profile...</span>
            </aside>
        );
    }

    const userRole = (session?.user as any)?.role;
    const isLoggedIn = !!session;

    const profileImage = isLoggedIn && session.user?.image ? session.user.image : "https://pexels.com";
    const userName = isLoggedIn && session.user?.name ? session.user.name : "Guest User";

    return (
        <aside className="w-64 bg-slate-900 text-white min-h-screen p-6 flex flex-col justify-between sticky top-0 h-screen shadow-xl">
            <div className="flex flex-col gap-8">
                {/* User Context Card Header */}
                <div className="flex flex-col items-center text-center pb-6 border-b border-slate-800">
                    <img src={profileImage} alt="Profile Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-blue-500 mb-3 shadow-md" />
                    <h2 className="font-semibold text-lg tracking-tight truncate max-w-full text-slate-100">{userName}</h2>
                    <span className="text-xs font-bold tracking-wider text-blue-400 bg-blue-950/50 px-2.5 py-1 rounded mt-1 uppercase">
                        {isLoggedIn ? userRole : "Guest"}
                    </span>
                </div>

                {/* Dynamic Navigation Menu Items */}
                <nav className="flex flex-col gap-2">
                    {isLoggedIn ? (
                        <>
                            {/* === AUTHOR ACCOUNT DYNAMIC STATE TOGGLES === */}
                            {userRole === "Author" && setActiveView && (
                                <>
                                    <button
                                        onClick={() => setActiveView("create")}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded font-medium text-sm transition text-left focus:outline-none ${activeView === "create" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
                                    >
                                        📝 Create Blog
                                    </button>
                                    <button
                                        onClick={() => setActiveView("published")}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded font-medium text-sm transition text-left focus:outline-none ${activeView === "published" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
                                    >
                                        🌐 Published Blogs
                                    </button>
                                    <button
                                        onClick={() => setActiveView("drafts")}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded font-medium text-sm transition text-left focus:outline-none ${activeView === "drafts" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}
                                    >
                                        📁 Draft Blogs
                                    </button>
                                </>
                            )}

                            {/* === READER ACCOUNT ROUTE INTERACTIVE TOGGLES === */}
                            {userRole === "Reader" && setActiveView && (
                                <>
                                    <button onClick={() => setActiveView("blogs")} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded font-medium text-sm transition text-left focus:outline-none ${activeView === "blogs" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}>
                                        <span>📖</span> Blogs
                                    </button>
                                    {/* <button onClick={() => setActiveView("profile")} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded font-medium text-sm transition text-left focus:outline-none ${activeView === "profile" ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}>
                                        <span>👤</span> Update Profile
                                    </button> */}
                                </>
                            )}
                        </>
                    ) : (
                        /* === GUEST / LOGGED-OUT LINKS === */
                        <div className="flex flex-col gap-3 mt-2">
                            <p className="text-xs text-slate-400 px-2 font-medium text-center">Sign in to customize your feed or publish articles.</p>
                            <Link href="/login" className="flex items-center gap-3 px-4 py-2.5 bg-blue-600 text-center justify-center rounded font-semibold text-sm text-white hover:bg-blue-700 transition shadow-sm">🔐 Login</Link>
                            <Link href="/signup" className="flex items-center gap-3 px-4 py-2.5 bg-slate-800 text-center justify-center rounded font-semibold text-sm text-slate-200 hover:bg-slate-700 transition border border-slate-700">🚀 Register Account</Link>
                        </div>
                    )}
                </nav>
            </div>

            {/* Bottom Section: Logout Trigger */}
            {isLoggedIn && (
                <div className="pt-4 border-t border-slate-800">
                    <button onClick={() => signOut({ callbackUrl: "/login" })} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600/10 text-red-400 font-semibold text-sm rounded hover:bg-red-600 hover:text-white transition">
                        🚪 Logout
                    </button>
                </div>
            )}
        </aside>
    );
}
