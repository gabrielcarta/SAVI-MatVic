import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Sidebar from './components/layout/Sidebard';
import InventoryManagement from './pages/InventoryManagement';
import SalesManagement from './pages/SalesManagement'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('token');
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';
    return token && isAuth;
  });
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedStore, setSelectedStore] = useState({ id: 22, name: "Local N° 22", manager: "Ana García" });

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setActiveView('dashboard');
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard selectedStore={selectedStore} onStoreChange={setSelectedStore} />;
      case 'inventory':
        return <InventoryManagement selectedStore={selectedStore} onStoreChange={setSelectedStore} />;
      case 'sales':
        return <SalesManagement selectedStore={selectedStore} onStoreChange={setSelectedStore} />;
      default:
        return <Dashboard selectedStore={selectedStore} onStoreChange={setSelectedStore} />;
    }
  };

  return (
    <>
      {isAuthenticated ? (
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar 
            activeView={activeView} 
            onViewChange={setActiveView}
            onLogout={handleLogout}
          />
          <main className="flex-1 p-6 overflow-auto h-screen">
            {renderActiveView()}
          </main>
        </div>
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </>
  )
}

export default App
