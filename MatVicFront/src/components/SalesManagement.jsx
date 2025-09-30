import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Plus, ShoppingCart, Calendar, Search } from "lucide-react";
import { Separator } from "../ui/separator";

const mockProducts = [
  { id: 1, name: "Funda iPhone 15", price: 25, stock: 15 },
  { id: 2, name: "Cable USB-C 2m", price: 15, stock: 8 },
  { id: 3, name: "Protector Samsung S24", price: 20, stock: 12 },
  { id: 4, name: "Auriculares Bluetooth", price: 45, stock: 6 },
  { id: 5, name: "Cargador Inalámbrico", price: 30, stock: 2 },
];

const initialSales = [
  {
    id: 1,
    date: "2024-08-02",
    time: "10:30",
    items: [
      { productId: 1, productName: "Funda iPhone 15", quantity: 2, unitPrice: 25, total: 50 }
    ],
    total: 50,
    paymentMethod: "Efectivo",
    customerName: "María García"
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
  },
  {
    id: 3,
    date: "2024-08-01",
    time: "16:45",
    items: [
      { productId: 4, productName: "Auriculares Bluetooth", quantity: 1, unitPrice: 45, total: 45 }
    ],
    total: 45,
    paymentMethod: "Transferencia"
  }
];

export function SalesManagement() {
  const [sales, setSales] = useState(initialSales);
  const [isNewSaleDialogOpen, setIsNewSaleDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("all");

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sale.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPayment = selectedPaymentMethod === "all" || sale.paymentMethod === selectedPaymentMethod;
    return matchesSearch && matchesPayment;
  });

  const handleNewSale = (saleData) => {
    const newId = Math.max(...sales.map(s => s.id)) + 1;
    setSales([{ ...saleData, id: newId }, ...sales]);
    setIsNewSaleDialogOpen(false);
  };

  const todaySales = sales.filter(sale => sale.date === "2024-08-02");
  const todayTotal = todaySales.reduce((sum, sale) => sum + sale.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Gestión de Ventas</h1>
          <p className="text-muted-foreground">
            Registra nuevas ventas y consulta el historial
          </p>
        </div>
        <Button onClick={() => setIsNewSaleDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Venta
        </Button>
      </div>

      {/* Resumen del día */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas de Hoy</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaySales.length}</div>
            <p className="text-xs text-muted-foreground">
              transacciones realizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos de Hoy</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${todayTotal}</div>
            <p className="text-xs text-muted-foreground">
              total facturado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Promedio</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${todaySales.length > 0 ? Math.round(todayTotal / todaySales.length) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              por transacción
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Buscar venta</Label>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Buscar por cliente o producto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="w-48">
              <Label htmlFor="payment">Método de Pago</Label>
              <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los métodos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los métodos</SelectItem>
                  <SelectItem value="Efectivo">Efectivo</SelectItem>
                  <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                  <SelectItem value="Transferencia">Transferencia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historial de ventas */}
      <Card>
        <CardHeader>
          <CardTitle>Historial de Ventas ({filteredSales.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha/Hora</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Pago</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    <div>
                      <div>{new Date(sale.date).toLocaleDateString()}</div>
                      <div className="text-sm text-muted-foreground">{sale.time}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {sale.customerName || "Cliente anónimo"}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {sale.items.map((item, index) => (
                        <div key={index} className="text-sm">
                          {item.quantity}x {item.productName}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">${sale.total}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {sale.paymentMethod}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog para nueva venta */}
      <NewSaleDialog
        isOpen={isNewSaleDialogOpen}
        onClose={() => setIsNewSaleDialogOpen(false)}
        onSave={handleNewSale}
        products={mockProducts}
      />
    </div>
  );
}

function NewSaleDialog({ isOpen, onClose, onSave, products }) {
  const [saleItems, setSaleItems] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const addItem = (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = saleItems.find(item => item.productId === productId);
    if (existingItem) {
      setSaleItems(saleItems.map(item => 
        item.productId === productId 
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.unitPrice }
          : item
      ));
    } else {
      setSaleItems([...saleItems, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        unitPrice: product.price,
        total: product.price
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
    
    setSaleItems(saleItems.map(item => 
      item.productId === productId 
        ? { ...item, quantity, total: quantity * item.unitPrice }
        : item
    ));
  };

  const total = saleItems.reduce((sum, item) => sum + item.total, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (saleItems.length === 0 || !paymentMethod) return;

    const now = new Date();
    onSave({
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().slice(0, 5),
      items: saleItems,
      total,
      paymentMethod,
      customerName: customerName || undefined
    });

    // Reset form
    setSaleItems([]);
    setCustomerName("");
    setPaymentMethod("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Venta</DialogTitle>
          <DialogDescription>
            Selecciona los productos y completa la información de la venta
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información del cliente */}
          <div>
            <Label htmlFor="customer">Nombre del cliente (opcional)</Label>
            <Input
              id="customer"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Nombre del cliente"
            />
          </div>

          {/* Selección de productos */}
          <div>
            <Label>Agregar productos</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {products.map(product => (
                <Button
                  key={product.id}
                  type="button"
                  variant="outline"
                  className="justify-start text-left h-auto p-3"
                  onClick={() => addItem(product.id)}
                >
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">${product.price}</div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Items de la venta */}
          {saleItems.length > 0 && (
            <div>
              <Label>Productos en la venta</Label>
              <div className="border rounded-lg mt-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {saleItems.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.productId, Number(e.target.value))}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>${item.unitPrice}</TableCell>
                        <TableCell>${item.total}</TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(item.productId)}
                          >
                            Eliminar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="p-4 border-t">
                  <div className="flex justify-between items-center font-medium">
                    <span>Total:</span>
                    <span>${total}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Método de pago */}
          <div>
            <Label htmlFor="payment">Método de pago</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el método de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Efectivo">Efectivo</SelectItem>
                <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                <SelectItem value="Transferencia">Transferencia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saleItems.length === 0 || !paymentMethod}>
              Registrar Venta
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}