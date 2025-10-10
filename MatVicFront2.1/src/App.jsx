import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Sidebar from './components/layout/Sidebard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Verificar si hay token y está autenticado
    const token = localStorage.getItem('token');
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';
    return token && isAuth;
  });
  const [activeView, setActiveView] = useState('dashboard');

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
    <>
      {isAuthenticated ? (
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar 
            activeView={activeView} 
            onViewChange={setActiveView}
            onLogout={handleLogout}
          />
          <main className="flex-1 p-6 overflow-auto">
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
