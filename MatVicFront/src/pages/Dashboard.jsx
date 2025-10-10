import { useState, useEffect } from 'react'
import { DollarSign, Package, ShoppingCart, TrendingUp, AlertTriangle, MapPin, ChevronDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import StoreSelector from '../components/layout/StoreSelector';

// URL base de la API
const API_BASE_URL = 'https://matvicback.onrender.com/api';

export default function Dashboard({ selectedStore, onStoreChange }) {
  // Estados para datos de la API
  const [todayStats, setTodayStats] = useState({ total_ventas: 0, total_ingresos: 0 });
  const [monthStats, setMonthStats] = useState({ total_ventas: 0, total_ingresos: 0 });
  const [monthlyHistory, setMonthlyHistory] = useState([]);
  const [storesComparison, setStoresComparison] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [totalProductsStock, setTotalProductsStock] = useState(0);
  
  // Estados de carga
  const [isLoadingToday, setIsLoadingToday] = useState(true);
  const [isLoadingMonth, setIsLoadingMonth] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isLoadingComparison, setIsLoadingComparison] = useState(true);
  const [isLoadingRecentSales, setIsLoadingRecentSales] = useState(true);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Token de autenticación (obtenerlo del contexto o localStorage)
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Cargar todos los datos al montar el componente y cuando cambia el local
  useEffect(() => {
    fetchAllData();
  }, [selectedStore.id]);

  const fetchAllData = () => {
    fetchTodayStats();
    fetchMonthStats();
    fetchMonthlyHistory();
    fetchStoresComparison();
    fetchRecentSales();
    fetchLowStockAlerts();
    fetchTotalStock();
  };

  // Obtener estadísticas del día usando /byday/:date
  const fetchTodayStats = async () => {
    setIsLoadingToday(true);
    try {
      const today = new Date().toISOString().split('T')[0]; // formato YYYY-MM-DD
      const localParam = selectedStore.id === 'all' ? '' : `?local=${selectedStore.id === 22 ? 1 : 2}`;
      
      const response = await fetch(`${API_BASE_URL}/sales/byday/${today}${localParam}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      
      if (!response.ok) throw new Error('Error al cargar ventas del día');
      
      const data = await response.json();
      
      // DEBUG: Ver qué retorna la API
      console.log('📊 VENTAS DE HOY desde API:', data);
      
      // Calcular totales desde el array de ventas
      const total_ventas = data.length;
      const total_ingresos = data.reduce((sum, sale) => sum + parseFloat(sale.total || 0), 0);
      
      console.log('💰 Total ventas hoy:', total_ventas, 'Ingresos:', total_ingresos);
      
      setTodayStats({ total_ventas, total_ingresos });
    } catch (err) {
      console.error('Error:', err);
      setTodayStats({ total_ventas: 0, total_ingresos: 0 });
    } finally {
      setIsLoadingToday(false);
    }
  };

  // Obtener estadísticas del mes usando /bymonth/:month
  const fetchMonthStats = async () => {
    setIsLoadingMonth(true);
    try {
      const today = new Date();
      const month = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`; // formato YYYY-MM
      const localParam = selectedStore.id === 'all' ? '' : `?local=${selectedStore.id === 22 ? 1 : 2}`;
      
      const response = await fetch(`${API_BASE_URL}/sales/bymonth/${month}${localParam}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      
      if (!response.ok) throw new Error('Error al cargar ventas del mes');
      
      const data = await response.json();
      
      // DEBUG: Ver qué retorna la API del mes
      console.log('📅 VENTAS DEL MES desde API:', data);
      
      // Calcular totales desde el array de ventas
      const total_ventas = data.length;
      const total_ingresos = data.reduce((sum, sale) => sum + parseFloat(sale.total || 0), 0);
      
      console.log('💵 Total ventas mes:', total_ventas, 'Ingresos:', total_ingresos);
      
      setMonthStats({ total_ventas, total_ingresos });
    } catch (err) {
      console.error('Error:', err);
      setMonthStats({ total_ventas: 0, total_ingresos: 0 });
    } finally {
      setIsLoadingMonth(false);
    }
  };

  // Obtener histórico de 6 meses (requiere nuevo endpoint)
  const fetchMonthlyHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const localParam = selectedStore.id === 'all' ? '' : `?local=${selectedStore.id === 22 ? 1 : 2}`;
      
      const response = await fetch(`${API_BASE_URL}/sales/stats/monthly-history${localParam}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      
      if (!response.ok) throw new Error('Endpoint no disponible');
      
      const data = await response.json();
      setMonthlyHistory(data);
    } catch (err) {
      console.error('Error:', err);
      setMonthlyHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Obtener comparación entre locales (requiere nuevo endpoint)
  const fetchStoresComparison = async () => {
    setIsLoadingComparison(true);
    try {
      const response = await fetch(`${API_BASE_URL}/sales/stats/comparison`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      
      if (!response.ok) throw new Error('Endpoint no disponible');
      
      const data = await response.json();
      setStoresComparison(data);
    } catch (err) {
      console.error('Error:', err);
      setStoresComparison([]);
    } finally {
      setIsLoadingComparison(false);
    }
  };

  // Obtener ventas recientes usando /recent
  const fetchRecentSales = async () => {
    setIsLoadingRecentSales(true);
    try {
      const response = await fetch(`${API_BASE_URL}/sales/recent?limit=10`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      
      if (!response.ok) throw new Error('Error al cargar ventas recientes');
      
      const data = await response.json();
      
      // DEBUG: Ver ventas recientes
      console.log('🛒 VENTAS RECIENTES desde API:', data);
      
      // Transformar datos para el formato esperado
      const formattedSales = data.map((sale, index) => ({
        id: index + 1,
        product: sale.productos && sale.productos.length > 0 ? sale.productos[0] : 'Venta múltiple',
        amount: parseFloat(sale.total),
        time: new Date(sale.fecha_emision).toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }),
        location: sale.local || 'Sin local'
      }));
      
      setRecentSales(formattedSales);
    } catch (err) {
      console.error('Error:', err);
      setRecentSales([]);
    } finally {
      setIsLoadingRecentSales(false);
    }
  };

  const fetchLowStockAlerts = async () => {
    setIsLoadingAlerts(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products/alerts`);
      if (!response.ok) {
        throw new Error('Error al cargar alertas de stock');
      }
      const data = await response.json();
      setLowStockProducts(data);
    } catch (err) {
      console.error('Error:', err);
      setLowStockProducts([]);
    } finally {
      setIsLoadingAlerts(false);
    }
  };

  const fetchTotalStock = async () => {
    setIsLoadingProducts(true);
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) {
        throw new Error('Error al cargar productos');
      }
      const data = await response.json();
      // Sumar el stock total de todos los productos
      const totalStock = data.reduce((sum, product) => sum + (product.stock || 0), 0);
      setTotalProductsStock(totalStock);
    } catch (err) {
      console.error('Error:', err);
      setTotalProductsStock(0);
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
          {isLoadingToday ? (
            <div className="text-2xl font-bold text-pickled-bluewood-800">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-pickled-bluewood-600"></div>
            </div>
          ) : todayStats.total_ingresos === 0 && todayStats.total_ventas === 0 ? (
            <div>
              <div className="text-2xl font-bold text-pickled-bluewood-400">$0</div>
              <p className="text-xs text-pickled-bluewood-400 mt-1">Sin ventas hoy</p>
            </div>
          ) : (
            <div className="text-2xl font-bold text-pickled-bluewood-800">
              ${todayStats.total_ingresos?.toFixed(0) || 0}
            </div>
          )}
          {!isLoadingToday && (todayStats.total_ingresos > 0 || todayStats.total_ventas > 0) && (
            <p className="text-xs text-pickled-bluewood-500 mt-1">
              {todayStats.total_ventas} {todayStats.total_ventas === 1 ? 'venta' : 'ventas'}
            </p>
          )}
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
          ) : totalProductsStock === 0 ? (
            <div>
              <div className="text-2xl font-bold text-pickled-bluewood-400">0</div>
              <p className="text-xs text-pickled-bluewood-400 mt-1">Sin productos</p>
            </div>
          ) : (
            <div className="text-2xl font-bold text-pickled-bluewood-800">{totalProductsStock}</div>
          )}
          {!isLoadingProducts && totalProductsStock > 0 && (
            <p className="text-xs text-pickled-bluewood-500 mt-1">
              {lowStockProducts.length} productos con stock bajo
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg border border-pickled-bluewood-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-pickled-bluewood-700">Ventas del Mes - Total</h3>
            <ShoppingCart className="h-4 w-4 text-pickled-bluewood-400" />
          </div>
          {isLoadingMonth ? (
            <div className="text-2xl font-bold text-pickled-bluewood-800">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-pickled-bluewood-600"></div>
            </div>
          ) : monthStats.total_ventas === 0 ? (
            <div>
              <div className="text-2xl font-bold text-pickled-bluewood-400">0</div>
              <p className="text-xs text-pickled-bluewood-400 mt-1">Sin ventas este mes</p>
            </div>
          ) : (
            <div className="text-2xl font-bold text-pickled-bluewood-800">{monthStats.total_ventas}</div>
          )}
          {!isLoadingMonth && monthStats.total_ventas > 0 && (
            <p className="text-xs text-pickled-bluewood-500 mt-1">
              {selectedStore.id === 'all' ? 'Ambos locales combinados' : selectedStore.name}
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg border border-pickled-bluewood-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-pickled-bluewood-700">Ingresos del Mes - Total</h3>
            <TrendingUp className="h-4 w-4 text-pickled-bluewood-400" />
          </div>
          {isLoadingMonth ? (
            <div className="text-2xl font-bold text-pickled-bluewood-800">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-pickled-bluewood-600"></div>
            </div>
          ) : monthStats.total_ingresos === 0 ? (
            <div>
              <div className="text-2xl font-bold text-pickled-bluewood-400">$0</div>
              <p className="text-xs text-pickled-bluewood-400 mt-1">Sin ingresos este mes</p>
            </div>
          ) : (
            <div className="text-2xl font-bold text-pickled-bluewood-800">
              ${monthStats.total_ingresos?.toFixed(0)}
            </div>
          )}
          {!isLoadingMonth && monthStats.total_ingresos > 0 && (
            <p className="text-xs text-pickled-bluewood-500 mt-1">
              {selectedStore.id === 'all' ? 'Ambos locales combinados' : selectedStore.name}
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Gráfico de ventas */}
        <div className="bg-white rounded-lg border border-pickled-bluewood-200 p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-pickled-bluewood-800">
              Ventas por Mes - {selectedStore?.name}
            </h3>
            <p className="text-sm text-pickled-bluewood-500">
              Evolución de ventas en los últimos 6 meses
            </p>
          </div>
          {isLoadingHistory ? (
            <div className="h-[200px] flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pickled-bluewood-600 mb-2"></div>
                <p className="text-sm text-pickled-bluewood-500">Cargando histórico...</p>
              </div>
            </div>
          ) : monthlyHistory.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center">
              <div className="text-center">
                <AlertTriangle className="h-12 w-12 text-pickled-bluewood-300 mx-auto mb-2" />
                <p className="text-pickled-bluewood-400 font-medium">Sin datos históricos</p>
                <p className="text-sm text-pickled-bluewood-400 mt-1">
                  No hay ventas en los últimos 6 meses
                </p>
              </div>
            </div>
          ) : (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyHistory}>
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
          )}
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
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-pickled-bluewood-600 mb-2"></div>
              <p className="text-sm text-pickled-bluewood-500">Cargando alertas...</p>
            </div>
          ) : lowStockProducts.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-green-400 mx-auto mb-2" />
              <p className="text-pickled-bluewood-600 font-medium">¡Todo en orden!</p>
              <p className="text-sm text-pickled-bluewood-400 mt-1">
                No hay productos con stock bajo
              </p>
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
            Las últimas transacciones en ambos locales
          </p>
        </div>
        {isLoadingRecentSales ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-pickled-bluewood-600 mb-2"></div>
            <p className="text-sm text-pickled-bluewood-500">Cargando ventas...</p>
          </div>
        ) : recentSales.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="h-12 w-12 text-pickled-bluewood-300 mx-auto mb-2" />
            <p className="text-pickled-bluewood-600 font-medium">Sin ventas recientes</p>
            <p className="text-sm text-pickled-bluewood-400 mt-1">
              No hay transacciones registradas
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentSales.slice(0, 6).map((sale) => (
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
                  ${sale.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comparación entre locales */}
      <div className="bg-white rounded-lg border border-pickled-bluewood-200 p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-pickled-bluewood-800">Comparación entre Locales</h3>
          <p className="text-sm text-pickled-bluewood-500">
            Rendimiento comparativo de ambos locales hoy
          </p>
        </div>
        {isLoadingComparison ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-pickled-bluewood-600 mb-2"></div>
            <p className="text-sm text-pickled-bluewood-500">Cargando comparación...</p>
          </div>
        ) : storesComparison.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-pickled-bluewood-300 mx-auto mb-2" />
            <p className="text-pickled-bluewood-600 font-medium">Sin datos de comparación</p>
            <p className="text-sm text-pickled-bluewood-400 mt-1">
              No se pudo cargar información de los locales
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {storesComparison.map((store) => {
              const isActiveStore = selectedStore?.id === (store.id_local === 1 ? 22 : 106);
              
              return (
                <div key={store.id_local} className="p-4 border border-pickled-bluewood-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-pickled-bluewood-800">{store.nombre_local}</h4>
                    {isActiveStore && (
                      <span className="px-2 py-1 bg-pickled-bluewood-600 text-white rounded text-xs">
                        Activo
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-pickled-bluewood-600">Ventas hoy:</span>
                      <span className="font-medium text-pickled-bluewood-800">
                        ${store.ventas_hoy?.toFixed(0) || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-pickled-bluewood-600">Productos:</span>
                      <span className="font-medium text-pickled-bluewood-800">{store.total_productos || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-pickled-bluewood-600">Stock bajo:</span>
                      <span className={`font-medium ${store.stock_bajo > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {store.stock_bajo || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-pickled-bluewood-600">Encargado:</span>
                      <span className="font-medium text-pickled-bluewood-800">{store.encargado || 'Sin asignar'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
