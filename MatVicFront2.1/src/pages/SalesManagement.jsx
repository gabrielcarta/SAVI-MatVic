import React, { useState, useEffect } from 'react'
import { Plus, ShoppingCart, Calendar, Search, MapPin, TrendingUp, X } from "lucide-react";
import StoreSelector from '../components/layout/StoreSelector';

// Datos de ventas por local
const storeSalesData = {
  22: [
    {
      id: 1,
      date: "2024-08-02",
      time: "10:30",
      items: [
        { productId: 1, productName: "Funda iPhone 15", quantity: 2, unitPrice: 25, total: 50 }
      ],
      total: 50,
      paymentMethod: "Efectivo",
      customerName: "María García",
      location: "Local N° 22"
    },
    {
      id: 2,
      date: "2024-08-02",
      time: "11:15",
      items: [
        { productId: 2, productName: "Cable USB-C 2m", quantity: 1, unitPrice: 15, total: 15 },
        { productId: 3, productName: "Protector Samsung S24", quantity: 1, unitPrice: 20, total: 20 }
      ],
      total: 35,
      paymentMethod: "Tarjeta",
      location: "Local N° 22"
    },
  ],
  106: [
    {
      id: 5,
      date: "2024-08-02",
      time: "09:45",
      items: [
        { productId: 8, productName: "Case iPhone 15 Pro", quantity: 1, unitPrice: 35, total: 35 }
      ],
      total: 35,
      paymentMethod: "Tarjeta",
      customerName: "Roberto Silva",
      location: "Local N° 106"
    },
  ]
};

const stores = [
  { id: 22, name: "Local N° 22", manager: "Ana García" },
  { id: 106, name: "Local N° 106", manager: "Carlos López" }
];

export default function SalesManagement({ selectedStore, onStoreChange }) {
  const [sales, setSales] = useState(storeSalesData);
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isNewSaleDialogOpen, setIsNewSaleDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all");

  const currentStoreSales = selectedStore ? (sales[selectedStore.id] || []) : [];

  // Cargar productos desde la API
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const response = await fetch('https://matvicback.onrender.com/api/products');
      if (!response.ok) {
        throw new Error('Error al cargar los productos');
      }
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const filteredSales = currentStoreSales.filter(sale => {
    const matchesSearch = sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sale.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPayment = selectedPaymentMethod === "all" || sale.paymentMethod === selectedPaymentMethod;
    return matchesSearch && matchesPayment;
  });

  const handleNewSale = async (saleData) => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (!token) {
        alert('No hay sesión activa. Por favor, inicia sesión nuevamente.');
        return;
      }

      // Preparar el body según el formato de la API
      const saleBody = {
        metodo_pago: saleData.paymentMethod,
        id_empleado: user.id_empleado || 1, // ID del empleado desde la sesión
        id_cliente: null, // Por ahora sin cliente específico
        items: saleData.items.map(item => ({
          id_producto: item.productId,
          cantidad: item.quantity,
          precio_unit: item.unitPrice
        }))
      };

      const response = await fetch('https://matvicback.onrender.com/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(saleBody)
      });

      if (response.status === 401) {
        alert('Sesión expirada. Por favor, inicia sesión nuevamente.');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al registrar la venta');
      }

      const result = await response.json();
      
      // Agregar la venta al estado local
      const storeId = selectedStore.id;
      const newSale = {
        id: result.id_boleta,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        items: saleData.items,
        total: result.total,
        paymentMethod: saleData.paymentMethod,
        customerName: saleData.customerName,
        location: selectedStore.name
      };

      setSales(prev => ({
        ...prev,
        [storeId]: [newSale, ...(prev[storeId] || [])]
      }));

      setIsNewSaleDialogOpen(false);
      
      // Actualizar lista de productos para reflejar cambios en stock
      fetchProducts();
      
      alert(`Venta registrada exitosamente. Boleta #${result.id_boleta}`);
      console.log('Venta registrada:', result);
    } catch (err) {
      console.error('Error al registrar venta:', err);
      alert(`Error al registrar la venta: ${err.message}`);
    }
  };

  const todaySales = currentStoreSales.filter(sale => sale.date === "2024-08-02");
  const todayTotal = todaySales.reduce((sum, sale) => sum + sale.total, 0);

  const getAllStoresTodaySales = () => {
    const result = {};
    stores.forEach(store => {
      const storeTodaySales = (sales[store.id] || []).filter(sale => sale.date === "2024-08-02");
      result[store.id] = {
        count: storeTodaySales.length,
        total: storeTodaySales.reduce((sum, sale) => sum + sale.total, 0),
        store: store
      };
    });
    return result;
  };

  const allStoresTodaySales = getAllStoresTodaySales();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-pickled-bluewood-800 mb-2">Ventas</h1>
          <p className="text-pickled-bluewood-500">
            Registra nuevas ventas y consulta el historial del local
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <StoreSelector selectedStore={selectedStore} onStoreChange={onStoreChange} />
          <button
            onClick={() => setIsNewSaleDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-pickled-bluewood-600 text-white rounded-lg hover:bg-pickled-bluewood-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nueva Venta
          </button>
        </div>
      </div>

      {/* Resumen del día */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-white rounded-lg border border-pickled-bluewood-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-pickled-bluewood-700">Ventas de Hoy</h3>
            <ShoppingCart className="h-4 w-4 text-pickled-bluewood-400" />
          </div>
          <div className="text-2xl font-bold text-pickled-bluewood-800">{todaySales.length}</div>
          <p className="text-xs text-pickled-bluewood-500">transacciones realizadas</p>
        </div>

        <div className="bg-white rounded-lg border border-pickled-bluewood-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-pickled-bluewood-700">Ingresos de Hoy</h3>
            <Calendar className="h-4 w-4 text-pickled-bluewood-400" />
          </div>
          <div className="text-2xl font-bold text-pickled-bluewood-800">${todayTotal}</div>
          <p className="text-xs text-pickled-bluewood-500">total facturado</p>
        </div>

        <div className="bg-white rounded-lg border border-pickled-bluewood-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-pickled-bluewood-700">Ticket Promedio</h3>
            <TrendingUp className="h-4 w-4 text-pickled-bluewood-400" />
          </div>
          <div className="text-2xl font-bold text-pickled-bluewood-800">
            ${todaySales.length > 0 ? Math.round(todayTotal / todaySales.length) : 0}
          </div>
          <p className="text-xs text-pickled-bluewood-500">por transacción</p>
        </div>
      </div>

      {/* Comparación entre locales */}
      <div className="bg-white rounded-lg border border-pickled-bluewood-200 p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-pickled-bluewood-800">Resumen de Ventas - Todos los Locales (Hoy)</h3>
          <p className="text-sm text-pickled-bluewood-500">Comparación del rendimiento de ventas entre locales</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Object.entries(allStoresTodaySales).map(([storeId, data]) => (
            <div key={storeId} className="p-4 border border-pickled-bluewood-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-pickled-bluewood-800">{data.store.name}</h4>
                {selectedStore?.id.toString() === storeId && (
                  <span className="px-2 py-1 bg-pickled-bluewood-600 text-white rounded text-xs">Activo</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-pickled-bluewood-800">{data.count}</p>
                  <p className="text-xs text-pickled-bluewood-500">ventas</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-pickled-bluewood-800">${data.total}</p>
                  <p className="text-xs text-pickled-bluewood-500">ingresos</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-pickled-bluewood-100">
                <div className="flex justify-between text-sm">
                  <span className="text-pickled-bluewood-600">Ticket promedio:</span>
                  <span className="font-medium text-pickled-bluewood-800">
                    ${data.count > 0 ? Math.round(data.total / data.count) : 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-pickled-bluewood-600">Encargado:</span>
                  <span className="font-medium text-pickled-bluewood-800">{data.store.manager}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-pickled-bluewood-200 p-6 shadow-sm">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-pickled-bluewood-700 mb-2">Buscar venta</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-pickled-bluewood-400" />
              <input
                type="text"
                placeholder="Buscar por cliente o producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-pickled-bluewood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickled-bluewood-600"
              />
            </div>
          </div>
          <div className="w-48">
            <label className="block text-sm font-medium text-pickled-bluewood-700 mb-2">Método de Pago</label>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              className="w-full px-4 py-2 border border-pickled-bluewood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickled-bluewood-600"
            >
              <option value="all">Todos los métodos</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Tarjeta">Tarjeta</option>
              <option value="Transferencia">Transferencia</option>
            </select>
          </div>
        </div>
      </div>

      {/* Historial de ventas */}
      <div className="bg-white rounded-lg border border-pickled-bluewood-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-pickled-bluewood-200">
          <h3 className="text-lg font-semibold text-pickled-bluewood-800">
            Historial de Ventas - {selectedStore?.name} ({filteredSales.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-pickled-bluewood-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-pickled-bluewood-700 uppercase">Fecha/Hora</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pickled-bluewood-700 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pickled-bluewood-700 uppercase">Local</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pickled-bluewood-700 uppercase">Productos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pickled-bluewood-700 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pickled-bluewood-700 uppercase">Pago</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pickled-bluewood-100">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-pickled-bluewood-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-pickled-bluewood-800">{new Date(sale.date).toLocaleDateString()}</div>
                    <div className="text-sm text-pickled-bluewood-500">{sale.time}</div>
                  </td>
                  <td className="px-6 py-4 text-pickled-bluewood-700">
                    {sale.customerName || "Cliente anónimo"}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-pickled-bluewood-50 border border-pickled-bluewood-200 rounded text-xs text-pickled-bluewood-700">
                      {sale.location}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {sale.items.map((item, index) => (
                        <div key={index} className="text-sm text-pickled-bluewood-700">
                          {item.quantity}x {item.productName}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-pickled-bluewood-800">${sale.total}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-pickled-bluewood-50 border border-pickled-bluewood-200 rounded text-xs text-pickled-bluewood-700">
                      {sale.paymentMethod}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para nueva venta */}
      {isNewSaleDialogOpen && (
        <NewSaleDialog
          onClose={() => setIsNewSaleDialogOpen(false)}
          onSave={handleNewSale}
          products={products}
          isLoadingProducts={isLoadingProducts}
          storeName={selectedStore?.name}
        />
      )}
    </div>
  );
}

function NewSaleDialog({ onClose, onSave, products, isLoadingProducts, storeName }) {
  const [saleItems, setSaleItems] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Obtener categorías únicas de los productos
  const categories = [...new Set(products.map(p => p.categoria))].filter(Boolean);

  // Filtrar productos según búsqueda y categoría
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addItem = (productId) => {
    const product = products.find(p => p.id_producto === productId);
    if (!product) return;

    const existingItem = saleItems.find(item => item.productId === productId);
    if (existingItem) {
      // Solo incrementar cantidad - el backend validará el stock
      setSaleItems(saleItems.map(item => 
        item.productId === productId 
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unitPrice }
          : item
      ));
    } else {
      setSaleItems([...saleItems, {
        productId: product.id_producto,
        productName: product.nombre,
        quantity: 1,
        unitPrice: product.precio_unit,
        total: product.precio_unit
      }]);
    }
  };

  const removeItem = (productId) => {
    setSaleItems(saleItems.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    
    // Solo actualizar - el backend validará el stock
    setSaleItems(saleItems.map(item => 
      item.productId === productId 
        ? { ...item, quantity, total: quantity * item.unitPrice }
        : item
    ));
  };

  const total = saleItems.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saleItems.length === 0 || !paymentMethod) return;

    setIsSubmitting(true);
    try {
      await onSave({
        items: saleItems,
        paymentMethod,
        customerName: customerName || undefined
      });

      // Limpiar formulario
      setSaleItems([]);
      setCustomerName("");
      setPaymentMethod("");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para formatear precio en CLP
  const formatCLP = (amount) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-pickled-bluewood-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-pickled-bluewood-800">Nueva Venta - {storeName}</h2>
              <p className="text-sm text-pickled-bluewood-500 mt-1">
                Selecciona los productos y completa la información de la venta
              </p>
            </div>
            <button onClick={onClose} className="text-pickled-bluewood-400 hover:text-pickled-bluewood-600">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Panel izquierdo - Selección de productos */}
            <div className="space-y-4">
              {/* Información del cliente */}
              <div>
                <label className="block text-sm font-medium text-pickled-bluewood-700 mb-2">
                  Nombre del cliente (opcional)
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nombre del cliente"
                  className="w-full px-4 py-2 border border-pickled-bluewood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickled-bluewood-600"
                  disabled={isSubmitting}
                />
              </div>

              {/* Filtros de búsqueda */}
              <div>
                <label className="block text-sm font-medium text-pickled-bluewood-700 mb-2">Buscar productos</label>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-pickled-bluewood-400" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-pickled-bluewood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickled-bluewood-600"
                      disabled={isSubmitting}
                    />
                  </div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-pickled-bluewood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickled-bluewood-600"
                    disabled={isSubmitting}
                  >
                    <option value="all">Todas las categorías</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tabla de productos disponibles */}
              <div>
                <label className="block text-sm font-medium text-pickled-bluewood-700 mb-2">
                  Productos disponibles ({filteredProducts.length})
                </label>
                {isLoadingProducts ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-pickled-bluewood-600"></div>
                    <p className="text-sm text-pickled-bluewood-500 mt-2">Cargando productos...</p>
                  </div>
                ) : (
                  <div className="border border-pickled-bluewood-200 rounded-lg overflow-hidden">
                    <div className="max-h-96 overflow-y-auto">
                      <table className="w-full">
                        <thead className="bg-pickled-bluewood-50 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-pickled-bluewood-700">Producto</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-pickled-bluewood-700">Stock</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-pickled-bluewood-700">Precio</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-pickled-bluewood-700">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-pickled-bluewood-100">
                          {filteredProducts.length === 0 ? (
                            <tr>
                              <td colSpan="4" className="px-3 py-4 text-center text-sm text-pickled-bluewood-500">
                                No se encontraron productos
                              </td>
                            </tr>
                          ) : (
                            filteredProducts.map(product => (
                              <tr key={product.id_producto} className="hover:bg-pickled-bluewood-50">
                                <td className="px-3 py-2">
                                  <div className="text-sm font-medium text-pickled-bluewood-800">{product.nombre}</div>
                                  <div className="text-xs text-pickled-bluewood-500">{product.categoria}</div>
                                </td>
                                <td className="px-3 py-2 text-sm text-pickled-bluewood-700">{product.stock}</td>
                                <td className="px-3 py-2 text-sm text-pickled-bluewood-700">{formatCLP(product.precio_unit)}</td>
                                <td className="px-3 py-2 text-center">
                                  <button
                                    type="button"
                                    onClick={() => addItem(product.id_producto)}
                                    disabled={product.stock <= 0 || isSubmitting}
                                    className="p-1.5 text-pickled-bluewood-600 hover:bg-pickled-bluewood-100 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={product.stock <= 0 ? "Sin stock" : "Agregar producto"}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Panel derecho - Carrito de compra */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-pickled-bluewood-700 mb-2">
                  Productos en la venta ({saleItems.length})
                </label>
                {saleItems.length === 0 ? (
                  <div className="border-2 border-dashed border-pickled-bluewood-200 rounded-lg p-8 text-center">
                    <ShoppingCart className="h-12 w-12 text-pickled-bluewood-300 mx-auto mb-3" />
                    <p className="text-sm text-pickled-bluewood-500">
                      No hay productos en la venta
                    </p>
                    <p className="text-xs text-pickled-bluewood-400 mt-1">
                      Selecciona productos de la lista para agregarlos
                    </p>
                  </div>
                ) : (
                  <div className="border border-pickled-bluewood-200 rounded-lg overflow-hidden">
                    <div className="max-h-80 overflow-y-auto">
                      <table className="w-full">
                        <thead className="bg-pickled-bluewood-50 sticky top-0">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-pickled-bluewood-700">Producto</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-pickled-bluewood-700">Cant.</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-pickled-bluewood-700">Total</th>
                            <th className="px-3 py-2"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-pickled-bluewood-100">
                          {saleItems.map((item) => (
                            <tr key={item.productId}>
                              <td className="px-3 py-2">
                                <div className="text-sm font-medium text-pickled-bluewood-800">{item.productName}</div>
                                <div className="text-xs text-pickled-bluewood-500">{formatCLP(item.unitPrice)} c/u</div>
                              </td>
                              <td className="px-3 py-2">
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
                                  className="w-16 px-2 py-1 text-sm border border-pickled-bluewood-200 rounded focus:outline-none focus:ring-2 focus:ring-pickled-bluewood-600"
                                  disabled={isSubmitting}
                                />
                              </td>
                              <td className="px-3 py-2 text-sm font-medium text-pickled-bluewood-800">
                                {formatCLP(item.total)}
                              </td>
                              <td className="px-3 py-2">
                                <button
                                  type="button"
                                  onClick={() => removeItem(item.productId)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                  disabled={isSubmitting}
                                  title="Quitar producto"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Total */}
                    <div className="border-t-2 border-pickled-bluewood-200 bg-pickled-bluewood-50 p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-pickled-bluewood-700">Subtotal:</span>
                        <span className="text-lg font-bold text-pickled-bluewood-800">{formatCLP(total)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm text-pickled-bluewood-600">
                        <span>{saleItems.reduce((sum, item) => sum + item.quantity, 0)} productos</span>
                        <span>{saleItems.length} items diferentes</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Método de pago */}
              <div>
                <label className="block text-sm font-medium text-pickled-bluewood-700 mb-2">Método de pago</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 border border-pickled-bluewood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickled-bluewood-600"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Selecciona el método de pago</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta">Tarjeta</option>
                  <option value="Transferencia">Transferencia</option>
                </select>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-pickled-bluewood-200 text-pickled-bluewood-700 rounded-lg hover:bg-pickled-bluewood-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saleItems.length === 0 || !paymentMethod || isSubmitting}
                  className="flex-1 px-4 py-2 bg-pickled-bluewood-600 text-white rounded-lg hover:bg-pickled-bluewood-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isSubmitting ? 'Procesando...' : `Registrar ${formatCLP(total)}`}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
