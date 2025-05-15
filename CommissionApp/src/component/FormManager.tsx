"use client";

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

// In a real application, this would be stored in a database
const FORMS_KEY = 'comision_forms';

interface FormTemplate {
  id: string;
  title: string;
  recipientName: string;
  recipientAddress: string;
  grantorName: string;
  grantorAddress: string;
  createdAt: number;
}

const FormManager = () => {
  const [formData, setFormData] = useState<FormTemplate>({
    id: '',
    title: '委任状',
    recipientName: '',
    recipientAddress: '',
    grantorName: '',
    grantorAddress: '',
    createdAt: Date.now()
  });
  
  const [forms, setForms] = useState<FormTemplate[]>(() => {
    // Load saved forms from localStorage on component mount
    if (typeof window !== 'undefined') {
      const savedForms = localStorage.getItem(FORMS_KEY);
      return savedForms ? JSON.parse(savedForms) : [];
    }
    return [];
  });

  const [showForm, setShowForm] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    localStorage.setItem(FORMS_KEY, JSON.stringify(updatedForms));
    
    // Reset form
    setFormData({
      id: '',
      title: '委任状',
      recipientName: '',
      recipientAddress: '',
      grantorName: '',
      grantorAddress: '',
      createdAt: Date.now()
    });
    
    setShowForm(false);
  };

  const copyToClipboard = (id: string) => {
    const url = `${window.location.origin}/answer/${id}`;
    navigator.clipboard.writeText(url).then(
      () => {
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
      },
      (err) => console.error('Could not copy text: ', err)
    );
  };

  return (
    <div className="w-full p-6 bg-white rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">フォーム管理</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          {showForm ? 'キャンセル' : '新規フォーム作成'}
        </button>
      </div>
      
      {showForm && (
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
          
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded w-full mt-4"
          >
            フォームを作成
          </button>
        </form>
      )}
      
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">作成済みフォーム</h3>
        
        {forms.length === 0 ? (
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
