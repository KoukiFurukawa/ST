import React, { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid';
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
        grantorName: '',
        grantorAddress: '',
        createdAt: Date.now()
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

    const createNewForm = (e: React.FormEvent) => {
        e.preventDefault();
        const newForm = {
            ...formData,
            id: uuidv4(),
            createdAt: Date.now()
        };
        
        const updatedForms = [...forms, newForm];
        setForms(updatedForms);
        
        // Save to localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem(FORMS_KEY, JSON.stringify(updatedForms));
        }
        
        // Reset form
        setFormData({
            id: '',
            title: '委任状',
            description: '',
            recipientName: '',
            recipientAddress: '',
            grantorName: '',
            grantorAddress: '',
            createdAt: Date.now()
        });
        
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
                        name="recipientAddress"
                        value={formData.recipientAddress}
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
