"use client";

import React, { useState, useEffect } from 'react';
import { FormTemplate } from '@/lib/interfaces';
import { FORMS_KEY } from '../lib/constants';

// In a real application, this would be stored in a database
const FormManager = () => {


    // Important: Initialize with empty array to prevent hydration mismatch
    const [forms, setForms] = useState<FormTemplate[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);

    // Set isClient to true when component mounts on client
    useEffect(() => {
        setIsClient(true);

        // Load saved forms from localStorage only on client side
        const savedForms = localStorage.getItem(FORMS_KEY);
        if (savedForms) {
            setForms(JSON.parse(savedForms));
        }
    }, []);

    const copyToClipboard = (id: string) => {
        if (typeof navigator !== 'undefined') {
            const url = `${window.location.origin}/answer/${id}`;
            navigator.clipboard.writeText(url).then(
                () => {
                    setCopied(id);
                    setTimeout(() => setCopied(null), 2000);
                },
                (err) => console.error('Could not copy text: ', err)
            );
        }
    };

    return (
        <div className="flex-1 p-8">
            <h1 className="text-2xl font-bold mb-6">フォーム管理</h1>

            <div className="mb-4">
                <h3 className="text-xl font-semibold mb-2">作成済みフォーム</h3>

                {!isClient || forms.length === 0 ? (
                    <p className="text-gray-500">まだフォームが作成されていません。</p>
                ) : (
                    <div className="space-y-4">
                        {forms.map(form => (
                            <div key={form.id} className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-lg font-medium">{form.title}</h4>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => copyToClipboard(form.id)}
                                            className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm"
                                        >
                                            {copied === form.id ? 'コピー済み' : 'URLをコピー'}
                                        </button>
                                        <a
                                            href={`/answer/${form.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-gray-600 hover:bg-gray-700 text-white py-1 px-3 rounded text-sm"
                                        >
                                            表示
                                        </a>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mt-2">
                                    作成日: {new Date(form.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FormManager;
