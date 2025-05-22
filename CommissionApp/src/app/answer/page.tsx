"use client";

import React from "react";
import Link from "next/link";

const AnswerIndexPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">委任状作成システム</h1>
        
        <div className="text-center mb-8">
          <p className="mb-4">
            委任状を作成するには、管理画面から新しいフォームを作成してください。
          </p>
          <p className="text-sm text-gray-600">
            または以下のサンプルフォームを利用することができます。
          </p>
        </div>
        
        <div className="space-y-4">
          <Link href="/answer/1234" className="block w-full">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full">
              サンプルフォームを開く
            </button>
          </Link>
          
          <Link href="/" className="block w-full">
            <button className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded w-full">
              管理画面に戻る
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AnswerIndexPage;
