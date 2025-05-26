import React from 'react';

function SharedDocuments() {
    // サンプルデータ - 実際の実装ではAPIなどからデータを取得
    const sharedDocuments = [
        { id: 1, title: "株主総会委任状", shared: "2023-05-12", recipient: "田中太郎", status: "既読" },
        { id: 2, title: "取締役会議委任状", shared: "2023-05-17", recipient: "佐藤次郎", status: "未読" },
        { id: 3, title: "臨時総会委任状", shared: "2023-05-22", recipient: "鈴木花子", status: "署名済み" },
    ];

    return (
        <div className="flex-1 p-8">
            <h1 className="text-2xl font-bold mb-6">委任状管理 (共有後)</h1>
            
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">タイトル</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">共有日</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">宛先</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {sharedDocuments.map((doc) => (
                            <tr key={doc.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{doc.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.shared}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{doc.recipient}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                      ${doc.status === '署名済み' ? 'bg-green-100 text-green-800' : 
                                        doc.status === '既読' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {doc.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button className="text-blue-600 hover:text-blue-900 mr-4">詳細</button>
                                    <button className="text-red-600 hover:text-red-900">再送信</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default SharedDocuments;
