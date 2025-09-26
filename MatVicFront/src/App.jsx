import { useState } from "react";
import { Sidebar } from "./components/AdminSidebar";
import { Dashboard } from "./components/Dashboard";
import { InventoryManagement } from "./components/InventoryManagement";
import { SalesManagement } from "./components/SalesManagement";

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <InventoryManagement />;
      case 'sales':
        return <SalesManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="flex-1 p-6 overflow-auto bg-background">
        {renderActiveView()}
      </main>
    </div>
  );
}