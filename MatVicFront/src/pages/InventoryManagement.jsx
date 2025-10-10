import { useState, useEffect } from 'react';
import { Plus, Edit, Search, Package, MapPin, X, Trash2 } from "lucide-react";
import StoreSelector from '../components/layout/StoreSelector';

// Datos de respaldo mientras carga la API
const backupProducts = [
  { id_producto: 1, nombre: "Producto de ejemplo", descripcion: "Cargando desde servidor...", codigo: "EJ-001", categoria: "General", stock: 0, min_stock: 0, precio_unit: 0 }
];

// La lista de categorías ahora se genera dinámicamente desde los productos
// ...existing code...

const stores = [
  { id: 22, name: "Local N° 22" },
  { id: 106, name: "Local N° 106" }
];

// Función para formatear precios en pesos chilenos
const formatCLP = (amount) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(amount);
};

export default function InventoryManagement({ selectedStore, onStoreChange }) {
  const [products, setProducts] = useState(backupProducts);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [editingProduct, setEditingProduct] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  // Categorías únicas extraídas de los productos
  const categories = [...new Set(products.map(p => p.categoria).filter(Boolean))];

  // Cargar productos desde la API
  useEffect(() => {
    const cachedProducts = localStorage.getItem('cachedProducts');
    if (cachedProducts) {
      setProducts(JSON.parse(cachedProducts));
      setIsLoading(false);
    }
    
    fetchProducts();
    fetchLowStockCount();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('https://matvicback.onrender.com/api/products');
      if (!response.ok) {
        throw new Error('Error al cargar los productos');
      }
      const data = await response.json();
      setProducts(data);
      setIsFirstLoad(false);
      
      // Actualizar caché
      localStorage.setItem('cachedProducts', JSON.stringify(data));
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLowStockCount = async () => {
    try {
      const response = await fetch('https://matvicback.onrender.com/api/products/alerts');
      if (response.ok) {
        const data = await response.json();
        setLowStockCount(data.length);
      }
    } catch (err) {
      console.error('Error al cargar alertas:', err);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSaveProduct = async (productData) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('No hay sesión activa. Por favor, inicia sesión nuevamente.');
        return;
      }

      if (editingProduct) {
        // Actualizar producto existente usando la API
        const response = await fetch(`https://matvicback.onrender.com/api/products/${editingProduct.id_producto}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            nombre: productData.nombre,
            descripcion: productData.descripcion,
            categoria: productData.categoria,
            stock: productData.stock,
            min_stock: productData.min_stock,
            precio_unit: productData.precio_unit
          }),
        });

        if (response.status === 401) {
          alert('Sesión expirada. Por favor, inicia sesión nuevamente.');
          return;
        }

        if (!response.ok) {
          throw new Error('Error al actualizar el producto');
        }

        const updatedProduct = await response.json();
        
        // Actualizar el producto en el estado
        setProducts(prev => prev.map(p => 
          p.id_producto === editingProduct.id_producto ? updatedProduct : p
        ));
        
        // Actualizar caché
        const updatedProducts = products.map(p => 
          p.id_producto === editingProduct.id_producto ? updatedProduct : p
        );
        localStorage.setItem('cachedProducts', JSON.stringify(updatedProducts));
        
        console.log('Producto actualizado exitosamente:', updatedProduct);
        
        // Actualizar contador de stock bajo
        fetchLowStockCount();
      } else {
        // Agregar nuevo producto usando la API
        const response = await fetch('https://matvicback.onrender.com/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            nombre: productData.nombre,
            descripcion: productData.descripcion,
            categoria: productData.categoria,
            stock: productData.stock,
            min_stock: productData.min_stock,
            precio_unit: productData.precio_unit
          }),
        });

        if (response.status === 401) {
          alert('Sesión expirada. Por favor, inicia sesión nuevamente.');
          return;
        }

        if (!response.ok) {
          throw new Error('Error al crear el producto');
        }

        const newProduct = await response.json();
        setProducts(prev => [...prev, newProduct]);
        
        // Actualizar caché
        const updatedProducts = [...products, newProduct];
        localStorage.setItem('cachedProducts', JSON.stringify(updatedProducts));
        
        console.log('Producto creado exitosamente:', newProduct);
        
        // Actualizar contador de stock bajo
        fetchLowStockCount();
      }
      
      setEditingProduct(null);
      setIsDialogOpen(false);
    } catch (err) {
      console.error('Error al guardar producto:', err);
      alert('Error al guardar el producto. Intenta nuevamente.');
    }
  };

  const handleDeleteProduct = async (productId) => {
    // Confirmar antes de eliminar
    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.');
    
    if (!confirmDelete) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('No hay sesión activa. Por favor, inicia sesión nuevamente.');
        return;
      }

      // Eliminar producto usando la API
      const response = await fetch(`https://matvicback.onrender.com/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.status === 401) {
        alert('Sesión expirada. Por favor, inicia sesión nuevamente.');
        return;
      }

      if (!response.ok) {
        throw new Error('Error al eliminar el producto');
      }

      const result = await response.json();
      
      if (result.deleted) {
        // Eliminar el producto del estado
        setProducts(prev => prev.filter(p => p.id_producto !== productId));
        
        // Actualizar caché
        const updatedProducts = products.filter(p => p.id_producto !== productId);
        localStorage.setItem('cachedProducts', JSON.stringify(updatedProducts));
        
        console.log('Producto eliminado exitosamente');
        alert('Producto eliminado exitosamente');
        
        // Actualizar contador de stock bajo
        fetchLowStockCount();
      }
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      alert('Error al eliminar el producto. Intenta nuevamente.');
    }
  };

  const openEditDialog = (product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const getStockStatus = (stock, minStock) => {
    if (stock <= minStock) return { label: "Stock Bajo", color: "bg-red-100 text-red-700" };
    if (stock <= minStock * 2) return { label: "Stock Medio", color: "bg-yellow-100 text-yellow-700" };
    return { label: "Stock OK", color: "bg-green-100 text-green-700" };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-pickled-bluewood-800 mb-2">Inventario</h1>
          <p className="text-pickled-bluewood-500">
            Administra el catálogo de productos y controla el stock del local
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <StoreSelector selectedStore={selectedStore} onStoreChange={onStoreChange} />
          <button
            onClick={() => openEditDialog(null)}
            className="flex items-center gap-2 px-4 py-2 bg-pickled-bluewood-600 text-white rounded-lg hover:bg-pickled-bluewood-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Agregar Producto
          </button>
        </div>
      </div>

      {/* Resumen del inventario */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white rounded-lg border border-pickled-bluewood-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-pickled-bluewood-700">Total Productos</h3>
            <Package className="h-4 w-4 text-pickled-bluewood-400" />
          </div>
          <div className="text-2xl font-bold text-pickled-bluewood-800">{products.length}</div>
          <p className="text-xs text-pickled-bluewood-500">en catálogo</p>
        </div>

        <div className="bg-white rounded-lg border border-pickled-bluewood-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-pickled-bluewood-700">Stock Total</h3>
            <Package className="h-4 w-4 text-pickled-bluewood-400" />
          </div>
          <div className="text-2xl font-bold text-pickled-bluewood-800">
            {products.reduce((sum, p) => sum + (p.stock || 0), 0)}
          </div>
          <p className="text-xs text-pickled-bluewood-500">unidades disponibles</p>
        </div>

        <div className="bg-white rounded-lg border border-pickled-bluewood-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-pickled-bluewood-700">Stock Bajo</h3>
            <Package className="h-4 w-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600">
            {lowStockCount}
          </div>
          <p className="text-xs text-pickled-bluewood-500">productos</p>
        </div>

        <div className="bg-white rounded-lg border border-pickled-bluewood-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-pickled-bluewood-700">Valor Inventario</h3>
            <Package className="h-4 w-4 text-pickled-bluewood-400" />
          </div>
          <div className="text-2xl font-bold text-pickled-bluewood-800">
            {formatCLP(products.reduce((sum, p) => sum + (p.precio_unit * p.stock), 0))}
          </div>
          <p className="text-xs text-pickled-bluewood-500">valor total</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-pickled-bluewood-200 p-6 shadow-sm">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-pickled-bluewood-700 mb-2">Buscar producto</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-pickled-bluewood-400" />
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-pickled-bluewood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickled-bluewood-600"
              />
            </div>
          </div>
          <div className="w-48">
            <label className="block text-sm font-medium text-pickled-bluewood-700 mb-2">Categoría</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-pickled-bluewood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickled-bluewood-600"
            >
              <option value="all">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="bg-white rounded-lg border border-pickled-bluewood-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-pickled-bluewood-200">
          <h3 className="text-lg font-semibold text-pickled-bluewood-800 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Productos en {selectedStore?.name} ({filteredProducts.length})
          </h3>
        </div>

        {isLoading && isFirstLoad ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pickled-bluewood-600 mb-4"></div>
            <p className="text-pickled-bluewood-600 font-medium">Conectando con el servidor...</p>
            <p className="text-sm text-pickled-bluewood-500 mt-2">
              ⏱️ Primera carga: puede tardar 30-60 segundos
            </p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600 mb-2">Error: {error}</p>
            <button 
              onClick={fetchProducts}
              className="px-4 py-2 bg-pickled-bluewood-600 text-white rounded-lg hover:bg-pickled-bluewood-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-pickled-bluewood-500">
            No se encontraron productos
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-pickled-bluewood-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pickled-bluewood-700 uppercase">Producto</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pickled-bluewood-700 uppercase">Categoría</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pickled-bluewood-700 uppercase">Precio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pickled-bluewood-700 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pickled-bluewood-700 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pickled-bluewood-700 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pickled-bluewood-100">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.stock, product.min_stock);
                  return (
                    <tr key={product.id_producto} className="hover:bg-pickled-bluewood-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-pickled-bluewood-800">{product.nombre}</div>
                        <div className="text-sm text-pickled-bluewood-500">{product.descripcion}</div>
                      </td>
                      <td className="px-6 py-4 text-pickled-bluewood-700">{product.categoria}</td>
                      <td className="px-6 py-4 text-pickled-bluewood-700">{formatCLP(product.precio_unit)}</td>
                      <td className="px-6 py-4 text-pickled-bluewood-700">{product.stock} unidades</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                          {stockStatus.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditDialog(product)}
                            className="p-2 text-pickled-bluewood-600 hover:bg-pickled-bluewood-50 rounded transition-colors"
                            title="Editar producto"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id_producto)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Eliminar producto"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para agregar/editar producto */}
      {isDialogOpen && (
        <ProductDialog
          product={editingProduct}
          onClose={() => setIsDialogOpen(false)}
          onSave={handleSaveProduct}
          categories={categories}
          stores={stores}
          selectedStore={selectedStore}
        />
      )}
    </div>
  );
}

function ProductDialog({ product, onClose, onSave, categories, stores, selectedStore }) {
  const [formData, setFormData] = useState(
    product ? {
      nombre: product.nombre,
      descripcion: product.descripcion,
      categoria: product.categoria,
      precio_unit: product.precio_unit,
      stock: product.stock,
      min_stock: product.min_stock
    } : {
      nombre: '',
      descripcion: '',
      categoria: '',
      precio_unit: 0,
      stock: 0,
      min_stock: 5
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ 
      backgroundColor: 'hsl(210 27% 45% / 0.5)',
      borderColor: 'hsl(210 32% 55% / 0.3)'
    }}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-pickled-bluewood-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-pickled-bluewood-800">
              {product ? 'Editar Producto' : 'Agregar Nuevo Producto'}
            </h2>
            <button onClick={onClose} className="text-pickled-bluewood-400 hover:text-pickled-bluewood-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-sm text-pickled-bluewood-500 mt-1">
            {product ? 'Modifica la información del producto' : 'Ingresa los datos del nuevo producto'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-pickled-bluewood-700 mb-2">Nombre del producto</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              className="w-full px-4 py-2 border border-pickled-bluewood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickled-bluewood-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-pickled-bluewood-700 mb-2">Categoría</label>
            <select
              value={formData.categoria}
              onChange={(e) => setFormData({...formData, categoria: e.target.value})}
              className="w-full px-4 py-2 border border-pickled-bluewood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickled-bluewood-600"
              required
            >
              <option value="">Selecciona una categoría</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-pickled-bluewood-700 mb-2">Precio (CLP)</label>
              <input
                type="number"
                step="1"
                value={formData.precio_unit}
                onChange={(e) => setFormData({...formData, precio_unit: Number(e.target.value)})}
                className="w-full px-4 py-2 border border-pickled-bluewood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickled-bluewood-600"
                placeholder="Ej: 15000"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pickled-bluewood-700 mb-2">Stock actual</label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                className="w-full px-4 py-2 border border-pickled-bluewood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickled-bluewood-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-pickled-bluewood-700 mb-2">Stock mínimo</label>
            <input
              type="number"
              value={formData.min_stock}
              onChange={(e) => setFormData({...formData, min_stock: Number(e.target.value)})}
              className="w-full px-4 py-2 border border-pickled-bluewood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickled-bluewood-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-pickled-bluewood-700 mb-2">Descripción</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              className="w-full px-4 py-2 border border-pickled-bluewood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickled-bluewood-600"
              rows="3"
              placeholder="Descripción del producto..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-pickled-bluewood-200 text-pickled-bluewood-700 rounded-lg hover:bg-pickled-bluewood-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-pickled-bluewood-600 text-white rounded-lg hover:bg-pickled-bluewood-700 transition-colors"
            >
              {product ? 'Actualizar' : 'Agregar'} Producto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
