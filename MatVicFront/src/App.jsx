import { useState, createContext, useContext } from "react";
import { Sidebar } from "./components/AdminSidebar";
import { Dashboard } from "./components/Dashboard";
import { InventoryManagement } from "./components/InventoryManagement";
import { SalesManagement } from "./components/SalesManagement";
import './index.css'

const StoreContext = createContext({
  selectedStore: null,
  setSelectedStore: () => {},
  stores: []
});

export const useStore = () => useContext(StoreContext);

// Datos de los locales
const stores = [
  {
    id: 22,
    name: "Local N° 22",
    address: "Av. Principal #123, Centro",
    manager: "Ana García",
    phone: "+1 234-567-8901"
  },
  {
    id: 106,
    name: "Local N° 106", 
    address: "Centro Comercial Plaza Norte, Local 45",
    manager: "Carlos López",
    phone: "+1 234-567-8902"
  }
];

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedStore, setSelectedStore] = useState(null);

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
    <StoreContext.Provider value={{ selectedStore, setSelectedStore, stores }}>
      <div className="flex min-h-screen bg-background">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        <main className="flex-1 p-6 overflow-auto bg-background">
          {renderActiveView()}
        </main>
      </div>
    </StoreContext.Provider>
  );
}