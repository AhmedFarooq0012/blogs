"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

const RegisterPage = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("api/user/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                // Signup Page mein fetch ki body badlein:
                body: JSON.stringify({
                    username: name, // Backend "username" expect kar raha hai
                    email,
                    password,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("Registration successful! Please login.");
                router.push("/login");
            }
            else {
                toast.error(data.message || "Registration failed!");
            }
        }
        catch (err) {
            alert("Something went wrong!");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="flex items-center justify-center h-screen bg-gray-800">
            <div className="p-8 bg-white shadow-lg rounded-lg w-full max-w-md">
                <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Register</h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Name"
                        className="border p-3 rounded-md text-black"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email Address"
                        className="border p-3 rounded-md text-black"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="border p-3 rounded-md text-black"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button
                    
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white py-3 rounded-md font-semibold    transition disabled:bg-gray-400 hover:bg-blue-700"
                    >
                        {loading ? "Creating Account..." : "Register"}
                    </button>
                </form>
                <p className="text-center text-gray-600 mt-4">
                    Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Login</Link>
                </p>
            </div>
        </div>
    );
}
export default RegisterPage;