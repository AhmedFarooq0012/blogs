"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function UpdateProfile() {
    const { data: session, update: updateSession } = useSession();
    const [username, setUsername] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [profilePic, setProfilePic] = useState("");
    const [loading, setLoading] = useState(false);

    // Sync active profile data from NextAuth cookie session context on load
    useEffect(() => {
        if (session?.user) {
            setUsername(session.user.name || "");
            setNewEmail(session.user.email || "");
            setProfilePic((session.user as any).profilepic || session.user.image || "");
        }
    }, [session]);

    // Compress file natively & convert to tiny, cookie-safe Base64 string
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation layer checking file bounds
        if (file.size > 2 * 1024 * 1024) {
            toast.error("File is too large. Please select an image under 2MB.");
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const img = new Image();
            img.src = reader.result as string;
            img.onload = () => {
                const canvas = document.createElement("canvas");

                // Keeping size down to 100px saves massive cookie space!
                const MAX_WIDTH = 100;
                const scaleSize = MAX_WIDTH / img.width;

                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scaleSize;

                const ctx = canvas.getContext("2d");
                if (ctx) {
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                    // Dropping compression quality factor to 0.4 keeps strings tiny
                    const compressedBase64 = canvas.toDataURL("image/jpeg", 0.4);
                    setProfilePic(compressedBase64);
                }
            };
        };
        reader.onerror = (error) => {
            console.error("Base64 conversion crash exception:", error);
            toast.error("Failed to process your image file.");
        };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username.trim() || !newEmail.trim()) {
            toast.error("Username and Email are mandatory fields.");
            return;
        }

        setLoading(true);
        try {
            // Targets your route explicitly via PUT method
            const res = await fetch("/api/user/profileupdate", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: username.trim(),
                    profilepic: profilePic, // Uploads compact Base64 image payload strings
                    newEmail: newEmail.trim(),
                    // 🔒 Security Fix: role attribute is excluded completely from payload parameter definitions
                }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                toast.success(data.message || "Profile settings saved successfully!");

                // Sync NextAuth cookies using explicit model keys from database response definitions
                await updateSession({
                    ...session,
                    user: {
                        ...session?.user,
                        name: data.user.username,
                        email: data.user.email,
                        image: data.user.profilepic
                    },
                });
            } else {
                toast.error(data.error || "Failed to update profile changes.");
            }
        } catch (error) {
            console.error("Profile update failed:", error);
            toast.error("An error occurred. Please refresh and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white my-4 animate-in fade-in duration-200">
            <h2 className="text-2xl font-bold tracking-tight mb-1">Account Management</h2>
            <p className="text-sm text-slate-400 mb-6">Modify your profile settings, username, and identity image.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Profile Image View Module */}
                <div className="flex items-center gap-5 bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
                    <div className="relative w-20 h-20">
                        <img
                            src={profilePic || "https://pixabay.com"}
                            alt="Avatar Preview"
                            className="w-20 h-20 rounded-full object-cover border-2 border-blue-500 bg-slate-900"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://pixabay.com";
                            }}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Profile Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer text-slate-400"
                        />
                    </div>
                </div>

                {/* Username Input Field */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Update username"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                        required
                    />
                </div>

                {/* Email Address Input Field */}
                <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Email Address</label>
                    <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="Update email address"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                        required
                    />
                </div>

                {/* Action Form Trigger Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-3 rounded-lg transition disabled:bg-slate-800 disabled:text-slate-500 shadow-lg mt-2"
                >
                    {loading ? "Processing Adjustments..." : "Save Profile Data"}
                </button>
            </form>
        </div>
    );
}
