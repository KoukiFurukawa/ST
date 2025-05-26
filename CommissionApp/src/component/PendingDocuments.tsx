import React from 'react';

function PendingDocuments() {
    // サンプルデータ - 実際の実装ではAPIなどからデータを取得
    const pendingDocuments = [
        { id: 1, title: "株主総会委任状", created: "2023-05-10", recipient: "田中太郎" },
        { id: 2, title: "取締役会議委任状", created: "2023-05-15", recipient: "佐藤次郎" },
        { id: 3, title: "臨時総会委任状", created: "2023-05-20", recipient: "鈴木花子" },
    ];

    return (
        <div className="flex-1 p-8">
            <h1 className="text-2xl font-bold mb-6">委任状管理 (共有前)</h1>
            
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">タイトル</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">作成日</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">宛先</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {pendingDocuments.map((doc) => (
                            <tr key={doc.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doc.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.created}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.recipient}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button className="text-indigo-600 hover:text-indigo-900 mr-4">編集</button>
                                    <button className="text-green-600 hover:text-green-900">共有</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default PendingDocuments;
