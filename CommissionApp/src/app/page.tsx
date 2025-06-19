"use client"

import { useState } from "react";
import Sidebar from "@/component/sidebar";
import CreateForm from "@/component/CreateForm";
import FormManager from "@/component/FormManager";
import AnswerManagement from "@/component/AnswerManagement";
import AnswerAnalysis from "@/component/AnswerAnalysis";

export default function Home() {
  // デフォルトでは「委任状作成」タブを表示
  const [activeTab, setActiveTab] = useState('create');

  // 選択されたタブに応じたコンポーネントを表示
  const renderContent = () => {
    switch (activeTab) {
      case 'create':
        return <CreateForm />;
      case 'forms':
        return <FormManager />;
      case 'answer-management':
        return <AnswerManagement />;
      case 'answer-analysis':
        return <AnswerAnalysis />;
      default:
        return <CreateForm />;
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Fixed sidebar */}
      <div className="fixed top-0 left-0 h-screen">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      
      {/* Main content with left margin to account for sidebar */}
      <div className="ml-64 flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  );
}
