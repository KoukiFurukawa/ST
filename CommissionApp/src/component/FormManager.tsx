"use client";

import React, { useState, useEffect } from 'react';
import { FormTemplate } from '@/lib/interfaces';
import Swal from 'sweetalert2';

// In a real application, this would be stored in a database
const FormManager = () => {


    // Important: Initialize with empty array to prevent hydration mismatch
    const [forms, setForms] = useState<FormTemplate[]>([]);
    const [copied, setCopied] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);
    const [selectedFormDetails, setSelectedFormDetails] = useState<FormTemplate | null>(null);

    const handleFetchForms = async () => {
        try {
            // Call the internal API route instead of the external one
            const internalResponse = await fetch('/api/getforms', {
                method: 'POST', // Ensure this matches the method in your new API route
                headers: {
                    'Content-Type': 'application/json', // Usually good practice for POST
                },
                // body: JSON.stringify({}), // Add body if your internal API route expects it
            });

            if (!internalResponse.ok) {
                const errorData = await internalResponse.json();
                Swal.fire({
                    title: '処理失敗',
                    text: `フォームの取得に失敗しました: ${errorData.details || internalResponse.statusText}`,
                    icon: 'error',
                });
                return false;
            }

            const responseData = await internalResponse.json();
            // Ensure responseData is an array before mapping
            if (!Array.isArray(responseData)) {
                console.error("Received non-array response:", responseData);
                Swal.fire({
                    title: 'データ形式エラー',
                    text: 'サーバーから予期しない形式のデータが返されました。',
                    icon: 'error',
                });
                setForms([]); // Set to empty array or handle as appropriate
                return false;
            }
            
            const mappedForms: FormTemplate[] = responseData.map((form: any) => ({
                id: form.id, // Ensure all fields from FormTemplate are mapped
                title: form.title,
                description: form.description,
                recipientName: form.recipientName,
                recipientAddress: form.recipientAddress,
                created_at: form.created_at,
                open: form.open,
                // Add any other fields from your FormTemplate interface
                // If the API returns fields with different names, map them here
                // e.g., createdAt: form.creation_date,
            }));
            setForms(mappedForms);
            return true;
        } catch (error: any) {
            Swal.fire({
                title: '通信エラー',
                text: `フォームの取得中にエラーが発生しました: ${error?.message ?? error}`,
                icon: 'error',
            });
            return false;
        }
    }

    useEffect(() => {
        setIsClient(true);
        handleFetchForms();
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

    const handleShowDetails = (form: FormTemplate) => {
        if (selectedFormDetails && selectedFormDetails.id === form.id) {
            setSelectedFormDetails(null); // Hide if already shown
        } else {
            setSelectedFormDetails(form); // Show details
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
                                        <button
                                            onClick={() => handleShowDetails(form)}
                                            className="bg-gray-600 hover:bg-gray-700 text-white py-1 px-3 rounded text-sm"
                                        >
                                            {selectedFormDetails && selectedFormDetails.id === form.id ? '詳細を隠す' : '詳細を表示'}
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mt-2">
                                    作成日: {new Date(form.created_at).toLocaleDateString()}
                                </p>
                                {selectedFormDetails && selectedFormDetails.id === form.id && (
                                    <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
                                        <h5 className="text-md font-semibold mb-2 text-gray-800">フォーム詳細:</h5>
                                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                            <div>
                                                <dt className="font-medium text-gray-500">ID:</dt>
                                                <dd className="text-gray-900">{selectedFormDetails.id}</dd>
                                            </div>
                                            <div>
                                                <dt className="font-medium text-gray-500">タイトル:</dt>
                                                <dd className="text-gray-900">{selectedFormDetails.title}</dd>
                                            </div>
                                            <div className="col-span-1 md:col-span-2">
                                                <dt className="font-medium text-gray-500">説明:</dt>
                                                <dd className="text-gray-900 whitespace-pre-wrap">{selectedFormDetails.description}</dd>
                                            </div>
                                            <div>
                                                <dt className="font-medium text-gray-500">受任者名 (デフォルト):</dt>
                                                <dd className="text-gray-900">{selectedFormDetails.recipientName}</dd>
                                            </div>
                                            <div>
                                                <dt className="font-medium text-gray-500">受任者住所 (デフォルト):</dt>
                                                <dd className="text-gray-900">{selectedFormDetails.recipientAddress}</dd>
                                            </div>
                                            <div>
                                                <dt className="font-medium text-gray-500">作成日時:</dt>
                                                <dd className="text-gray-900">{new Date(selectedFormDetails.created_at).toLocaleString()}</dd>
                                            </div>
                                            <div>
                                                <dt className="font-medium text-gray-500">公開状態:</dt>
                                                <dd className="text-gray-900">{selectedFormDetails.open ? '公開' : '非公開'}</dd>
                                            </div>
                                        </dl>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FormManager;
