'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

interface CreatePostProps {
    editData?: any; // Accepts post payload values if editing
    onSuccess?: () => void; // Triggered to auto-close panels upon completion
}

const CreatePost: React.FC<CreatePostProps> = ({ editData, onSuccess }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [status, setStatus] = useState('Published');
    const [imageBase64, setImageBase64] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Pre-populate input fields if editData is passed down
    useEffect(() => {
        if (editData) {
            setTitle(editData.title || '');
            setContent(editData.content || '');
            setStatus(editData.status || 'Published');
            setImageBase64(editData.image || '');
        }
    }, [editData]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageBase64(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        const payload = {
            title,
            content,
            image: imageBase64 || "example.com",
            status
        };

        // Determine method structure and URL path string based on component state
        const apiPath = editData ? `/api/posts/${editData._id}` : '/api/posts/createpost';
        const httpMethod = editData ? 'PATCH' : 'POST';

        try {
            const response = await fetch(apiPath, {
                method: httpMethod,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                setMessage({
                    type: 'success',
                    text: editData ? '🎉 Post updated successfully!' : '🎉 Post created successfully!'
                });

                if (!editData) {
                    setTitle('');
                    setContent('');
                    setImageBase64('');
                    setStatus('Published');
                }

                // Auto return to dashboard list after 1.5 seconds on success
                if (onSuccess) {
                    setTimeout(() => onSuccess(), 1500);
                }
            } else {
                const errorData = await response.json().catch(() => ({}));
                setMessage({ type: 'error', text: errorData.message || 'Action failed.' });
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            setMessage({ type: 'error', text: 'An unexpected connection error occurred.' });
        } finally {
            setLoading(false);
        }
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['clean']
        ],
    };

    return (
        <div className="w-full max-w-3xl mx-auto p-6 bg-white rounded-lg shadow border border-gray-200 text-black my-4">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">
                    {editData ? 'Edit Document Entry' : 'Create New Blog Post'}
                </h1>
                <p className="text-gray-600 text-sm">
                    {editData ? 'Modify properties and rewrite elements dynamically.' : 'Compose and format live web text entries.'}
                </p>
            </div>

            {message.text && (
                <div className={`p-4 mb-4 rounded font-medium text-sm ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Post Title</label>
                    <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter title text..."
                        className="w-full border border-gray-300 rounded p-2.5 bg-white text-black"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Body Content</label>
                    <div className="prose max-w-none text-black">
                        <ReactQuill
                            theme="snow"
                            value={content}
                            onChange={setContent}
                            modules={modules}
                            className="bg-white min-h-50 rounded text-black"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Cover Image</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full border border-gray-300 rounded p-2 text-sm bg-white text-black file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700"
                    />
                    {imageBase64 && (
                        <div className="mt-3">
                            <img src={imageBase64} alt="Preview" className="w-40 h-24 object-cover rounded border" />
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Publication Status</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full border border-gray-300 rounded p-2.5 bg-white text-black"
                    >
                        <option value="Published">Published</option>
                        <option value="Draft">Draft</option>
                    </select>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`font-semibold py-2.5 px-6 rounded text-white shadow-sm transition-colors ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {loading ? 'Saving Changes...' : editData ? 'Update Post' : 'Submit Post'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreatePost;
