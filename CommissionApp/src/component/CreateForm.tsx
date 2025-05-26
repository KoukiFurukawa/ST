import React, { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid';
import Swal from 'sweetalert2'; // Import SweetAlert2
import { FormTemplate } from '@/lib/interfaces';
import { FORMS_KEY } from '@/lib/constants';

const CreateForm = () => {

    const [isClient, setIsClient] = useState(false);
    const [forms, setForms] = useState<FormTemplate[]>([]);

      // Set isClient to true when component mounts on client
    useEffect(() => {
        setIsClient(true);
        
        // Load saved forms from localStorage only on client side
        const savedForms = localStorage.getItem(FORMS_KEY);
        if (savedForms) {
            setForms(JSON.parse(savedForms));
        }
    }, []);

    const [formData, setFormData] = useState<FormTemplate>({
        id: '',
        title: '委任状',
        description: '',
        recipientName: '',
        recipientAddress: '',
        created_at: Date.now(),
        open: false
    });

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({
        ...prev,
        [name]: value
        }));
    };

    const handleSubmit = async (data: FormTemplate) => {
        const res = await fetch('/api/submit/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }, 
            body : JSON.stringify({
                "description": data.description,
            })
            // body: JSON.stringify(data)
        });

        const result = await res.json();
        console.log(result);
    };

    const createNewForm = async (e: React.FormEvent) => {
        e.preventDefault();

        // Input validation
        if (!formData.title || !formData.recipientName || !formData.recipientAddress || !formData.description) {
            Swal.fire({
                icon: 'error',
                title: '入力エラー',
                text: 'すべての必須項目を入力してください。',
            });
            return;
        }

        Swal.fire({
            title: '処理中...',
            text: 'フォームを送信しています。',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        const newForm = {
            ...formData,
            id: uuidv4(),
            createdAt: Date.now(),
            open: false // Default to closed
        };
        
        try {
            await handleSubmit(newForm); // Assume handleSubmit might throw an error or return a status

            const updatedForms = [...forms, newForm];
            setForms(updatedForms);
            
            // Save to localStorage
            if (typeof window !== 'undefined') {
                localStorage.setItem(FORMS_KEY, JSON.stringify(updatedForms));
            }

            Swal.fire({
                icon: 'success',
                title: '成功',
                text: 'フォームが正常に作成されました。',
            });

            // Reset form
            setFormData({
                id: '',
                title: '委任状',
                description: '',
                recipientName: '',
                recipientAddress: '',
                created_at: Date.now(),
                open: false
            });

        } catch (error) {
            console.error("Form submission error:", error);
            Swal.fire({
                icon: 'error',
                title: '送信エラー',
                text: 'フォームの送信中にエラーが発生しました。',
            });
        }
        
    };

    return (
        <div className="flex-1 p-8">
            <h1 className="text-2xl font-bold mb-6">委任状作成</h1>
            <form onSubmit={createNewForm} className="mb-8 p-4 border border-gray-200 rounded-lg">
                <div className="mb-4">
                    <label className="block mb-2">フォームタイトル:</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="border p-2 w-full"
                        required
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-2">受任者名 (デフォルト):</label>
                    <input
                        type="text"
                        name="recipientName"
                        value={formData.recipientName}
                        onChange={handleInputChange}
                        className="border p-2 w-full"
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-2">受任者住所 (デフォルト):</label>
                    <input
                        type="text"
                        name="recipientAddress"
                        value={formData.recipientAddress}
                        onChange={handleInputChange}
                        className="border p-2 w-full"
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-2">内容:</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="border p-2 w-full h-32 resize-y"
                        rows={4}
                    ></textarea>
                </div>

                <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded w-full mt-4"
                >
                    フォームを作成
                </button>
            </form>
        </div>
    );
}

export default CreateForm
