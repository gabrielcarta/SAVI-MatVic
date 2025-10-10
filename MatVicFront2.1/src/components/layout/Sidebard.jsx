import {
  Package,
  ShoppingCart,
  BarChart3,
  Smartphone,
  ChevronDown,
  LogOut,
  User,
} from "lucide-react";
import { useState } from "react";

export default function Sidebar({ activeView, onViewChange, onLogout }) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: BarChart3,
    },
    {
      id: "inventory",
      label: "Inventario",
      icon: Package,
    },
    {
      id: "sales",
      label: "Ventas",
      icon: ShoppingCart,
    },
  ];

  return (
    <div className="w-64 bg-slate-900 shadow-lg flex flex-col border-r border-slate-800">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Smartphone className="h-8 w-8 text-purple-500" />
          <div>
            <h1 className="text-white font-semibold text-lg">CellAccess</h1>
            <p className="text-sm text-slate-400">
              CHIBOLEX
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`w-full flex items-center justify-start px-4 py-2 rounded-md transition-colors duration-200 ${
                  activeView === item.id
                    ? "bg-slate-800 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
                onClick={() => onViewChange(item.id)}
              >
                <Icon className="h-4 w-4 mr-2" />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="text-xs text-slate-500 mb-4">
          <p>Accesorios de Celulares</p>
          <p>Sistema de Gestión v1.0</p>
        </div>

        {/* User Card */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-pickled-bluewood-600 flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-white">Joseph Alpha</p>
              <p className="text-xs text-slate-400">user@gmail.com</p>
            </div>
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-slate-800 rounded-lg shadow-lg border border-slate-700 overflow-hidden">
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-700 transition-colors text-red-400 hover:text-red-300"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
