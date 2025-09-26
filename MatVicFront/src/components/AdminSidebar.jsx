import {
  Package,
  ShoppingCart,
  BarChart3,
  Smartphone,
} from "lucide-react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

export function Sidebar({ activeView, onViewChange }) {
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
    <div className="w-64 bg-sidebar shadow-lg flex flex-col border-r border-sidebar-border">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <Smartphone className="h-8 w-8 text-sidebar-primary" />
          <div>
            <h1 className="text-sidebar-foreground">CellAccess</h1>
            <p className="text-sm text-sidebar-foreground/70">
              Admin Panel
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={
                  activeView === item.id ? "secondary" : "ghost"
                }
                className={`w-full justify-start ${
                  activeView === item.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
                onClick={() => onViewChange(item.id)}
              >
                <Icon className="h-4 w-4 mr-2" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <div className="text-xs text-sidebar-foreground/60">
          <p>Accesorios de Celulares</p>
          <p>Sistema de Gestión v1.0</p>
        </div>
      </div>
    </div>
  );
}