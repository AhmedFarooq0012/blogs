"use client";
import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
    const { data: session, status } = useSession();
    const isLoading = status === 'loading';

    return (
        <nav className="bg-slate-900 border-b border-gray-100 py-4 px-6 sticky top-0 z-50">
            <div className="max-w-4xl mx-auto flex justify-between items-center">

                {/* Blog Logo / Brand */}
                <Link href="/" className="text-xl font-serif font-bold tracking-tight text-white hover:opacity-80 transition">
                    The <span className="text-blue-600">Blog</span>
                </Link>

                {/* Dynamic Navigation Options */}
                <div className="flex items-center gap-6">
                    {/* Prevent element layout flash while authenticating */}
                    {!isLoading && (
                        session ? (
                            // Displayed only when user is Authenticated
                            <div className="flex items-center gap-5">
                                <span className="text-sm text-gray-500 font-medium">
                                    {session.user?.name || session.user?.email}
                                </span>
                                <button
                                    onClick={() => signOut({ callbackUrl: '/login' })}
                                    className="text-sm font-medium text-red-500 hover:text-red-600 transition"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            // Displayed only when user is a Guest
                            <div className="flex items-center gap-5">
                                <Link
                                    href="/login"
                                    className="text-sm font-medium text-gray-600 hover:text-blue-600 transition"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/signup"
                                    className="text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-800 transition"
                                >
                                    Register
                                </Link>
                            </div>
                        )
                    )}
                </div>

            </div>
        </nav>
    );
}
