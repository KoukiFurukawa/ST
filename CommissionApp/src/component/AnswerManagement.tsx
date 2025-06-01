import React, { useState, useEffect } from 'react';
import { FormTemplate, Answer } from '@/lib/interfaces'; // Import Answer
import Swal from 'sweetalert2';

interface FormsAndAnswersResponse {
    forms: FormTemplate[];
    answers: Answer[];
}

function AnswerManagement() {
    const [forms, setForms] = useState<FormTemplate[]>([]);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [selectedFormForDetails, setSelectedFormForDetails] = useState<FormTemplate | null>(null);
    const [selectedFormForAnswers, setSelectedFormForAnswers] = useState<FormTemplate | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/get_forms_and_answers', {
                    method: 'POST', // Matches the internal API route
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.details || `Failed to fetch data: ${response.statusText}`);
                }
                const data: FormsAndAnswersResponse = await response.json();
                
                // Convert created_at to number if they are strings from the API
                const processedForms = data.forms.map(form => ({
                    ...form,
                    created_at: typeof form.created_at === 'string' ? new Date(form.created_at).getTime() : form.created_at,
                }));
                const processedAnswers = data.answers.map(answer => ({
                    ...answer,
                    created_at: typeof answer.created_at === 'string' ? new Date(answer.created_at).getTime() : answer.created_at,
                }));

                setForms(processedForms || []);
                setAnswers(processedAnswers || []);

            } catch (error) {
                console.error("Error fetching forms and answers:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'データ取得エラー',
                    text: error instanceof Error ? error.message : 'フォームと回答の取得中にエラーが発生しました。',
                });
                setForms([]);
                setAnswers([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleShowDetails = (form: FormTemplate) => {
        if (selectedFormForDetails?.id === form.id) {
            setSelectedFormForDetails(null);
        } else {
            setSelectedFormForDetails(form);
            setSelectedFormForAnswers(null); // Close answers if showing details
        }
    };

    const handleShowAnswers = (form: FormTemplate) => {
        if (selectedFormForAnswers?.id === form.id) {
            setSelectedFormForAnswers(null);
        } else {
            setSelectedFormForAnswers(form);
            setSelectedFormForDetails(null); // Close details if showing answers
        }
    };

    const getAnswersForForm = (formId: string) => {
        return answers.filter(answer => answer.commissionID === formId);
    };

    if (isLoading) {
        return (
            <div className="flex-1 p-8">
                <h1 className="text-2xl font-bold mb-6">回答管理</h1>
                <p>データを読み込み中です...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 p-8">
            <h1 className="text-2xl font-bold mb-6">回答管理</h1>

            { forms.length === 0 ? (
                <p className="text-gray-500">利用可能なフォームはありません。</p>
            ) : (
                <div className="space-y-6">
                    {forms.map(form => (
                        <div key={form.id} className="p-4 border border-gray-300 rounded-lg shadow">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-xl font-semibold text-gray-800">{form.title}</h3>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleShowDetails(form)}
                                        className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm transition-colors"
                                    >
                                        {selectedFormForDetails?.id === form.id ? '詳細を隠す' : '詳細確認'}
                                    </button>
                                    <button
                                        onClick={() => handleShowAnswers(form)}
                                        className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded text-sm transition-colors"
                                    >
                                        {selectedFormForAnswers?.id === form.id ? '回答を隠す' : '回答一覧'}
                                    </button>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600">
                                作成日: {new Date(form.created_at).toLocaleDateString()}
                            </p>

                            {selectedFormForDetails?.id === form.id && (
                                <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
                                    <h4 className="text-md font-semibold mb-2 text-gray-700">フォーム詳細:</h4>
                                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                        <div><dt className="font-medium text-gray-500">ID:</dt><dd className="text-gray-900">{form.id}</dd></div>
                                        <div><dt className="font-medium text-gray-500">タイトル:</dt><dd className="text-gray-900">{form.title}</dd></div>
                                        <div className="col-span-1 md:col-span-2"><dt className="font-medium text-gray-500">説明:</dt><dd className="text-gray-900 whitespace-pre-wrap">{form.description}</dd></div>
                                        <div><dt className="font-medium text-gray-500">受任者名:</dt><dd className="text-gray-900">{form.recipientName}</dd></div>
                                        <div><dt className="font-medium text-gray-500">受任者住所:</dt><dd className="text-gray-900">{form.recipientAddress}</dd></div>
                                        <div><dt className="font-medium text-gray-500">公開状態:</dt><dd className="text-gray-900">{form.open ? '公開' : '非公開'}</dd></div>
                                    </dl>
                                </div>
                            )}

                            {selectedFormForAnswers?.id === form.id && (
                                <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-md">
                                    <h4 className="text-md font-semibold mb-2 text-gray-700">回答一覧 ({getAnswersForForm(form.id).length}件):</h4>
                                    {getAnswersForForm(form.id).length > 0 ? (
                                        <ul className="space-y-2">
                                            {getAnswersForForm(form.id).map(answer => (
                                                <li key={answer.id} className="p-2 border-b border-gray-200 text-sm">
                                                    <p><span className="font-medium text-gray-600">回答者ID:</span> {answer.userId}</p>
                                                    <p><span className="font-medium text-gray-600">回答日時:</span> {new Date(answer.created_at).toLocaleString()}</p>
                                                    <p className="mt-1 whitespace-pre-wrap"><span className="font-medium text-gray-600">内容:</span> {answer.answer}</p>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500">このフォームに対する回答はまだありません。</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AnswerManagement;
