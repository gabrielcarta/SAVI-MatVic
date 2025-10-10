import { useState, useEffect } from 'react'
import { DollarSign, Package, ShoppingCart, TrendingUp, AlertTriangle, MapPin, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import StoreSelector from '../components/layout/StoreSelector';

// Datos simulados por local
const storeData = {
  22: {
    todaySales: 1250,
    todayGrowth: 20,
    totalProducts: 157,
    lowStockCount: 12,
    monthlySales: 89,
    monthlyGrowth: 15,
    monthlyRevenue: 25480,
    revenueGrowth: 12,
    salesData: [
      { month: "Ene", sales: 12000 },
      { month: "Feb", sales: 15000 },
      { month: "Mar", sales: 18000 },
      { month: "Abr", sales: 16000 },
      { month: "May", sales: 22000 },
      { month: "Jun", sales: 25000 },
    ],
    lowStockProducts: [
      { name: "Funda iPhone 14", stock: 3, location: "Local N° 22" },
      { name: "Cable USB-C", stock: 5, location: "Local N° 22" },
      { name: "Protector Samsung A54", stock: 2, location: "Local N° 22" },
      { name: "Auriculares Bluetooth", stock: 1, location: "Local N° 22" },
    ],
    recentSales: [
      { id: 1, product: "Funda transparente", amount: 15, time: "10:30 AM", location: "Local N° 22" },
      { id: 2, product: "Cable Lightning", amount: 25, time: "11:15 AM", location: "Local N° 22" },
      { id: 3, product: "Protector de pantalla", amount: 20, time: "12:00 PM", location: "Local N° 22" },
    ]
  },
  106: {
    todaySales: 950,
    todayGrowth: 12,
    totalProducts: 143,
    lowStockCount: 8,
    monthlySales: 67,
    monthlyGrowth: 18,
    monthlyRevenue: 19200,
    revenueGrowth: 25,
    salesData: [
      { month: "Ene", sales: 8500 },
      { month: "Feb", sales: 11200 },
      { month: "Mar", sales: 13800 },
      { month: "Abr", sales: 12400 },
      { month: "May", sales: 16500 },
      { month: "Jun", sales: 19200 },
    ],
    lowStockProducts: [
      { name: "Case iPhone 15 Pro", stock: 2, location: "Local N° 106" },
      { name: "Cargador Rápido", stock: 4, location: "Local N° 106" },
      { name: "Protector Xiaomi", stock: 1, location: "Local N° 106" },
      { name: "Cable Tipo C", stock: 3, location: "Local N° 106" },
    ],
    recentSales: [
      { id: 4, product: "Funda con anillo", amount: 18, time: "09:45 AM", location: "Local N° 106" },
      { id: 5, product: "Cargador inalámbrico", amount: 35, time: "10:20 AM", location: "Local N° 106" },
      { id: 6, product: "Auriculares TWS", amount: 28, time: "11:30 AM", location: "Local N° 106" },
    ]
  }
};

const getConsolidatedData = () => {
  const stores = Object.keys(storeData);
  let consolidated = {
    todaySales: 0,
    totalProducts: 0,
    lowStockCount: 0,
    monthlySales: 0,
    monthlyRevenue: 0,
    allLowStockProducts: [],
    allRecentSales: []
  };

  stores.forEach(storeId => {
    const data = storeData[storeId];
    consolidated.todaySales += data.todaySales;
    consolidated.totalProducts += data.totalProducts;
    consolidated.lowStockCount += data.lowStockCount;
    consolidated.monthlySales += data.monthlySales;
    consolidated.monthlyRevenue += data.monthlyRevenue;
    consolidated.allLowStockProducts = [...consolidated.allLowStockProducts, ...data.lowStockProducts];
    consolidated.allRecentSales = [...consolidated.allRecentSales, ...data.recentSales];
  });

  consolidated.allRecentSales.sort((a, b) => {
    const timeA = a.time.replace(/[^\d:]/g, '');
    const timeB = b.time.replace(/[^\d:]/g, '');
    return timeB.localeCompare(timeA);
  });

  return consolidated;
};

export default function Dashboard({ selectedStore, onStoreChange }) {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(true);
  const [totalProductsStock, setTotalProductsStock] = useState(0);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  const currentData = storeData[selectedStore.id];
  const consolidatedData = getConsolidatedData();

  // Cargar productos con stock bajo desde la API
  useEffect(() => {
    fetchLowStockAlerts();
    fetchTotalStock();
  }, []);

  const fetchLowStockAlerts = async () => {
    setIsLoadingAlerts(true);
    try {
      const response = await fetch('https://matvicback.onrender.com/api/products/alerts');
      if (!response.ok) {
        throw new Error('Error al cargar alertas de stock');
      }
      const data = await response.json();
      setLowStockProducts(data);
    } catch (err) {
      console.error('Error:', err);
      // Usar datos de respaldo si falla
      setLowStockProducts(consolidatedData.allLowStockProducts);
    } finally {
      setIsLoadingAlerts(false);
    }
  };

  const fetchTotalStock = async () => {
    setIsLoadingProducts(true);
    try {
      const response = await fetch('https://matvicback.onrender.com/api/products');
      if (!response.ok) {
        throw new Error('Error al cargar productos');
      }
      const data = await response.json();
      // Sumar el stock total de todos los productos
      const totalStock = data.reduce((sum, product) => sum + (product.stock || 0), 0);
      setTotalProductsStock(totalStock);
    } catch (err) {
      console.error('Error:', err);
      // Usar datos de respaldo si falla
      setTotalProductsStock(consolidatedData.totalProducts);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-pickled-bluewood-800 mb-2">Dashboard</h2>
          <p className="text-pickled-bluewood-500">
            Vista general del local de accesorios para celulares
          </p>
        </div>
        
        <StoreSelector selectedStore={selectedStore} onStoreChange={onStoreChange} />
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-lg border border-pickled-bluewood-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-pickled-bluewood-700">Ventas de Hoy - Total</h3>
            <DollarSign className="h-4 w-4 text-pickled-bluewood-400" />
          </div>
          <div className="text-2xl font-bold text-pickled-bluewood-800">${consolidatedData.todaySales}</div>
          <p className="text-xs text-pickled-bluewood-500 mt-1">
            Ambos locales combinados
          </p>
        </div>

        <div className="bg-white rounded-lg border border-pickled-bluewood-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-pickled-bluewood-700">Productos en Stock - Total</h3>
            <Package className="h-4 w-4 text-pickled-bluewood-400" />
          </div>
          {isLoadingProducts ? (
            <div className="text-2xl font-bold text-pickled-bluewood-800">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-pickled-bluewood-600"></div>
            </div>
          ) : (
            <div className="text-2xl font-bold text-pickled-bluewood-800">{totalProductsStock}</div>
          )}
          <p className="text-xs text-pickled-bluewood-500 mt-1">
            {lowStockProducts.length} productos con stock bajo
          </p>
        </div>

        <div className="bg-white rounded-lg border border-pickled-bluewood-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-pickled-bluewood-700">Ventas del Mes - Total</h3>
            <ShoppingCart className="h-4 w-4 text-pickled-bluewood-400" />
          </div>
          <div className="text-2xl font-bold text-pickled-bluewood-800">{consolidatedData.monthlySales}</div>
          <p className="text-xs text-pickled-bluewood-500 mt-1">
            Ambos locales combinados
          </p>
        </div>

        <div className="bg-white rounded-lg border border-pickled-bluewood-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-pickled-bluewood-700">Ingresos del Mes - Total</h3>
            <TrendingUp className="h-4 w-4 text-pickled-bluewood-400" />
          </div>
          <div className="text-2xl font-bold text-pickled-bluewood-800">${consolidatedData.monthlyRevenue}</div>
          <p className="text-xs text-pickled-bluewood-500 mt-1">
            Ambos locales combinados
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Gráfico de ventas */}
        <div className="bg-white rounded-lg border border-pickled-bluewood-200 p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-pickled-bluewood-800">Ventas por Mes - {selectedStore?.name}</h3>
            <p className="text-sm text-pickled-bluewood-500">
              Evolución de ventas en los últimos 6 meses
            </p>
          </div>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentData.salesData}>
                <XAxis dataKey="month" stroke="#8B9DC3" />
                <YAxis stroke="#8B9DC3" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #C7D6E2',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="sales" fill="hsl(210, 28%, 37%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Productos con stock bajo */}
        <div className="bg-white rounded-lg border border-pickled-bluewood-200 p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-pickled-bluewood-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Stock Bajo - Todos los Locales
            </h3>
            <p className="text-sm text-pickled-bluewood-500">
              Productos que necesitan reposición urgente
            </p>
          </div>
          
          {isLoadingAlerts ? (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-pickled-bluewood-600"></div>
              <p className="text-sm text-pickled-bluewood-500 mt-2">Cargando alertas...</p>
            </div>
          ) : lowStockProducts.length === 0 ? (
            <div className="text-center py-4 text-pickled-bluewood-500">
              No hay productos con stock bajo
            </div>
          ) : (
            <div className="space-y-3">
              {lowStockProducts.slice(0, 8).map((product) => (
                <div key={product.id_producto} className="flex items-center justify-between py-2 border-b border-pickled-bluewood-100 last:border-b-0">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-pickled-bluewood-800">{product.nombre}</span>
                    <span className="text-xs text-pickled-bluewood-500">{product.categoria}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.stock <= 2 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-pickled-bluewood-100 text-pickled-bluewood-700'
                  }`}>
                    {product.stock} unidades
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ventas recientes */}
      <div className="bg-white rounded-lg border border-pickled-bluewood-200 p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-pickled-bluewood-800">Ventas Recientes - Todos los Locales</h3>
          <p className="text-sm text-pickled-bluewood-500">
            Las últimas transacciones de hoy en ambos locales
          </p>
        </div>
        <div className="space-y-3">
          {consolidatedData.allRecentSales.slice(0, 6).map((sale) => (
            <div key={sale.id} className="flex items-center justify-between py-2 border-b border-pickled-bluewood-100 last:border-b-0">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-pickled-bluewood-800">{sale.product}</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-pickled-bluewood-500">{sale.time}</span>
                  <span className="px-2 py-0.5 bg-pickled-bluewood-50 border border-pickled-bluewood-200 rounded text-xs text-pickled-bluewood-700">
                    {sale.location}
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 bg-pickled-bluewood-50 border border-pickled-bluewood-200 rounded text-sm font-medium text-pickled-bluewood-700">
                ${sale.amount}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Comparación entre locales */}
      <div className="bg-white rounded-lg border border-pickled-bluewood-200 p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-pickled-bluewood-800">Comparación entre Locales</h3>
          <p className="text-sm text-pickled-bluewood-500">
            Rendimiento comparativo de ambos locales hoy
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(storeData).map(([storeId, data]) => {
            const store = storeId === "22" ? 
              { name: "Local N° 22", manager: "Ana García" } : 
              { name: "Local N° 106", manager: "Carlos López" };
            
            return (
              <div key={storeId} className="p-4 border border-pickled-bluewood-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-pickled-bluewood-800">{store.name}</h4>
                  {selectedStore?.id.toString() === storeId && (
                    <span className="px-2 py-1 bg-pickled-bluewood-600 text-white rounded text-xs">
                      Activo
                    </span>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-pickled-bluewood-600">Ventas hoy:</span>
                    <span className="font-medium text-pickled-bluewood-800">${data.todaySales}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-pickled-bluewood-600">Productos:</span>
                    <span className="font-medium text-pickled-bluewood-800">{data.totalProducts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-pickled-bluewood-600">Stock bajo:</span>
                    <span className="font-medium text-red-600">{data.lowStockCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-pickled-bluewood-600">Encargado:</span>
                    <span className="font-medium text-pickled-bluewood-800">{store.manager}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
