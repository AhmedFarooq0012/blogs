"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import AuthorContent from "@/components/authorcontent";
import DraftPost from "@/components/draftpost";
import CreatePost from "@/components/createpost";

type AuthorViews = "published" | "drafts" | "create" | "blogs" | "profile";

export default function AuthorDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeView, setActiveView] = useState<AuthorViews>("published");
    const [editingPost, setEditingPost] = useState<any>(null);

    // 🔒 1. Strict Session Router Guard
    useEffect(() => {
        if (status === "unauthenticated") {
            router.replace("/login");
        }
    }, [status, router]);

    // 🔒 2. Total Back-Button History Lockout
    useEffect(() => {
        if (status !== "authenticated") return;

        // Push an artificial state anchor onto browser history tracking stack
        window.history.pushState(null, "", window.location.href);

        const handlePopState = () => {
            // Re-apply current route anchor state immediately to completely block history backtracking
            window.history.pushState(null, "", window.location.href);

            // If user is inside the nested Create/Edit workspace view, drop back to the main list safely
            if (activeView === "create") {
                setEditingPost(null);
                setActiveView("published");
            } else {
                alert("🔒 Active Session Protected: You are already logged in. Use the 'Logout' button to leave your account securely.");
            }
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [status, activeView]);

    // Render clean loader framework layout while session token values are resolving asynchronously
    if (status === "loading") {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center text-black">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm font-semibold text-gray-500">Verifying security token context...</p>
                </div>
            </div>
        );
    }

    if (status === "unauthenticated") return null;

    const renderMainViewport = () => {
        switch (activeView) {
            case "create":
                return (
                    <CreatePost
                        editData={editingPost}
                        onSuccess={() => {
                            setEditingPost(null);
                            setActiveView("published");
                        }}
                    />
                );
            case "drafts":
                return (
                    <DraftPost
                        onEditForward={(post: any) => {
                            setEditingPost(post);
                            setActiveView("create");
                        }}
                    />
                );
            case "published":
            default:
                return (
                    <AuthorContent
                        onEditForward={(post) => {
                            setEditingPost(post);
                            setActiveView("create");
                        }}
                        onNewPostClick={() => setActiveView("create")}
                    />
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 text-black flex flex-col">
            <Navbar />
            <div className="flex flex-1 relative">
                <div className="hidden md:block">
                    <Sidebar activeView={activeView} setActiveView={setActiveView} />
                </div>
                <main className="flex-1 p-6 overflow-y-auto">
                    {renderMainViewport()}
                </main>
            </div>
        </div>
    );
}
