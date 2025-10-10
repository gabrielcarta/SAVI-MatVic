import React, { useState } from 'react'
import { Plus, Edit, Search, Package, MapPin, ArrowUpDown, X } from "lucide-react";

// Datos de productos por local
const storeInventory = {
  22: [
    { id: 1, name: "Funda iPhone 15", category: "Fundas", price: 25, stock: 15, minStock: 5, description: "Funda transparente para iPhone 15", location: "Local N° 22" },
    { id: 2, name: "Cable USB-C 2m", category: "Cables", price: 15, stock: 8, minStock: 10, description: "Cable USB-C de 2 metros", location: "Local N° 22" },
    { id: 3, name: "Protector Samsung S24", category: "Protectores", price: 20, stock: 12, minStock: 5, description: "Protector de pantalla templado", location: "Local N° 22" },
    { id: 4, name: "Auriculares Bluetooth", category: "Audio", price: 45, stock: 6, minStock: 3, description: "Auriculares inalámbricos", location: "Local N° 22" },
    { id: 5, name: "Cargador Inalámbrico", category: "Cargadores", price: 30, stock: 2, minStock: 5, description: "Base de carga inalámbrica 15W", location: "Local N° 22" },
  ],
  106: [
    { id: 8, name: "Case iPhone 15 Pro", category: "Fundas", price: 35, stock: 2, minStock: 4, description: "Case premium con MagSafe", location: "Local N° 106" },
    { id: 9, name: "Cargador Rápido 65W", category: "Cargadores", price: 45, stock: 4, minStock: 6, description: "Cargador rápido USB-C 65W", location: "Local N° 106" },
    { id: 10, name: "Protector Xiaomi", category: "Protectores", price: 15, stock: 1, minStock: 5, description: "Protector 9H para Xiaomi", location: "Local N° 106" },
  ]
};

const categories = ["Fundas", "Cables", "Protectores", "Audio", "Cargadores", "Accesorios", "Otros"];

const stores = [
  { id: 22, name: "Local N° 22" },
  { id: 106, name: "Local N° 106" }
];

export default function InventoryManagement() {
  const selectedStore = { id: 22, name: "Local N° 22" };
  const [products, setProducts] = useState(storeInventory);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [editingProduct, setEditingProduct] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [transferProduct, setTransferProduct] = useState(null);

  const currentStoreProducts = selectedStore ? (products[selectedStore.id] || []) : [];

  const filteredProducts = currentStoreProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSaveProduct = (productData) => {
    const storeId = selectedStore.id;
    if (editingProduct) {
      setProducts(prev => ({
        ...prev,
        [storeId]: prev[storeId].map(p => p.id === editingProduct.id ? { ...productData, id: editingProduct.id } : p)
      }));
    } else {
      const newId = Math.max(...Object.values(products).flat().map(p => p.id)) + 1;
      setProducts(prev => ({
        ...prev,
        [storeId]: [...(prev[storeId] || []), { ...productData, id: newId }]
      }));
    }
    setEditingProduct(null);
    setIsDialogOpen(false);
  };

  const openEditDialog = (product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const openTransferDialog = (product) => {
    setTransferProduct(product);
    setIsTransferDialogOpen(true);
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
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-5 w-5 text-pickled-bluewood-600" />
            <h1 className="text-2xl font-bold text-pickled-bluewood-800">Inventario - {selectedStore?.name}</h1>
          </div>
          <p className="text-pickled-bluewood-500">
            Administra el catálogo de productos y controla el stock del local
          </p>
        </div>
        <button
          onClick={() => openEditDialog(null)}
          className="flex items-center gap-2 px-4 py-2 bg-pickled-bluewood-600 text-white rounded-lg hover:bg-pickled-bluewood-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Agregar Producto
        </button>
      </div>

      {/* Resumen del inventario */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="bg-white rounded-lg border border-pickled-bluewood-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-pickled-bluewood-700">Total Productos</h3>
            <Package className="h-4 w-4 text-pickled-bluewood-400" />
          </div>
          <div className="text-2xl font-bold text-pickled-bluewood-800">{currentStoreProducts.length}</div>
          <p className="text-xs text-pickled-bluewood-500">en catálogo</p>
        </div>

        <div className="bg-white rounded-lg border border-pickled-bluewood-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-pickled-bluewood-700">Stock Total</h3>
            <Package className="h-4 w-4 text-pickled-bluewood-400" />
          </div>
          <div className="text-2xl font-bold text-pickled-bluewood-800">
            {currentStoreProducts.reduce((sum, p) => sum + p.stock, 0)}
          </div>
          <p className="text-xs text-pickled-bluewood-500">unidades</p>
        </div>

        <div className="bg-white rounded-lg border border-pickled-bluewood-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-pickled-bluewood-700">Stock Bajo</h3>
            <Package className="h-4 w-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600">
            {currentStoreProducts.filter(p => p.stock <= p.minStock).length}
          </div>
          <p className="text-xs text-pickled-bluewood-500">productos</p>
        </div>

        <div className="bg-white rounded-lg border border-pickled-bluewood-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-pickled-bluewood-700">Valor Inventario</h3>
            <Package className="h-4 w-4 text-pickled-bluewood-400" />
          </div>
          <div className="text-2xl font-bold text-pickled-bluewood-800">
            ${currentStoreProducts.reduce((sum, p) => sum + (p.price * p.stock), 0)}
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-pickled-bluewood-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-pickled-bluewood-700 uppercase">Producto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pickled-bluewood-700 uppercase">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pickled-bluewood-700 uppercase">Ubicación</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pickled-bluewood-700 uppercase">Precio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pickled-bluewood-700 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pickled-bluewood-700 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-pickled-bluewood-700 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pickled-bluewood-100">
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product.stock, product.minStock);
                return (
                  <tr key={product.id} className="hover:bg-pickled-bluewood-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-pickled-bluewood-800">{product.name}</div>
                      <div className="text-sm text-pickled-bluewood-500">{product.description}</div>
                    </td>
                    <td className="px-6 py-4 text-pickled-bluewood-700">{product.category}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-pickled-bluewood-50 border border-pickled-bluewood-200 rounded text-xs text-pickled-bluewood-700">
                        {product.location}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-pickled-bluewood-700">${product.price}</td>
                    <td className="px-6 py-4 text-pickled-bluewood-700">{product.stock} unidades</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                        {stockStatus.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => openEditDialog(product)}
                        className="p-2 text-pickled-bluewood-600 hover:bg-pickled-bluewood-50 rounded transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
    product || {
      name: '',
      category: '',
      price: 0,
      stock: 0,
      minStock: 5,
      description: '',
      location: selectedStore?.name || ''
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2 border border-pickled-bluewood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickled-bluewood-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-pickled-bluewood-700 mb-2">Categoría</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
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
              <label className="block text-sm font-medium text-pickled-bluewood-700 mb-2">Precio ($)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                className="w-full px-4 py-2 border border-pickled-bluewood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickled-bluewood-600"
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
              value={formData.minStock}
              onChange={(e) => setFormData({...formData, minStock: Number(e.target.value)})}
              className="w-full px-4 py-2 border border-pickled-bluewood-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pickled-bluewood-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-pickled-bluewood-700 mb-2">Descripción</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
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
