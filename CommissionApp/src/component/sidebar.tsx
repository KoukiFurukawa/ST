"use client"

import React from "react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'create', label: '委任状作成' },
    { id: 'forms', label: 'フォーム管理' },
    { id: 'pending', label: '保留中' },
    { id: 'shared', label: '共有済み' },
  ];

  return (
    <div className="w-64 h-screen bg-gray-800 text-white p-5">
      <h1 className="text-2xl font-bold mb-6">委任状 App</h1>
      <nav>
        <ul>
          {tabs.map(tab => (
            <li key={tab.id} className="mb-2">
              <button
                className={`w-full text-left py-2 px-4 rounded transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-700'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;