"use client";
import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const res = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (res?.error) {
            setLoading(false);
            toast.error(res.error || "Login failed!");
            return;
        }

        try {
            // Fetch session client-side to inspect the authenticated user's role
            const sessionRes = await fetch('/api/auth/session');
            const session = await sessionRes.json();
            const userRole = session?.user?.role;

            toast.success("Login successful!");
            router.refresh();

            // Dynamic route enforcement based on database user role
            if (userRole === "Author") {
                router.push("/dashboard/author");
            } else if (userRole === "Reader") {
                router.push("/dashboard/reader");
            } else {
                router.push("/"); // Fallback redirection path
            }
        } catch (error) {
            console.error("Session evaluation failed:", error);
            router.push("/");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
            <div className="p-8 bg-white shadow-lg rounded-lg w-full max-w-md">
                <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Login</h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="email"
                        placeholder="Email Address"
                        className="border p-3 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-black"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="border p-3 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-black"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white py-3 rounded-md font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
                    >
                        {loading ? "Processing..." : "Login"}
                    </button>
                </form>
                <p className="text-center text-gray-600 mt-4">
                    Don't have an account? <Link href="/signup" className="text-blue-600 hover:underline">Register</Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;
