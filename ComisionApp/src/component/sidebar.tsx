import React from 'react';

type SidebarProps = {
    activeTab: string;
    setActiveTab: (tab: string) => void;
};

function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
    return (
        <div className="flex flex-col w-64 h-screen bg-gray-800 text-white">
            <div className="flex items-center justify-center h-16 bg-gray-900">
                <h1 className="text-xl font-bold">ComisionApp</h1>
            </div>
            <nav className="flex flex-col mt-4">
                <button 
                    onClick={() => setActiveTab('create')} 
                    className={`px-4 py-2 text-left ${activeTab === 'create' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                >
                    委任状作成
                </button>
                <button 
                    onClick={() => setActiveTab('pending')} 
                    className={`px-4 py-2 text-left ${activeTab === 'pending' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                >
                    委任状管理 (共有前)
                </button>
                <button 
                    onClick={() => setActiveTab('shared')} 
                    className={`px-4 py-2 text-left ${activeTab === 'shared' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                >
                    委任状管理 (共有後)
                </button>
            </nav>
        </div>
    );
}

export default Sidebar;