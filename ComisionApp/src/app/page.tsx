"use client"

import { useState } from "react";
import Sidebar from "@/component/sidebar";
import CreateForm from "@/component/CreateForm";
import PendingDocuments from "@/component/PendingDocuments";
import SharedDocuments from "@/component/SharedDocuments";

export default function Home() {
  // デフォルトでは「委任状作成」タブを表示
  const [activeTab, setActiveTab] = useState('create');

  // 選択されたタブに応じたコンポーネントを表示
  const renderContent = () => {
    switch (activeTab) {
      case 'create':
        return <CreateForm />;
      case 'pending':
        return <PendingDocuments />;
      case 'shared':
        return <SharedDocuments />;
      default:
        return <CreateForm />;
    }
  };

  return (
    <div className="flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      {renderContent()}
    </div>
  );
}
