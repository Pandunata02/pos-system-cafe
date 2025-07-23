"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar, useSidebarToggle } from "@/components/app-sidebar"
import { SidebarToggleButton } from "@/components/sidebar-toggle-button"
import { LiveDashboardStats } from "@/components/live-dashboard-stats"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Store,
  TrendingUp,
  Package,
  ShoppingCart,
  FileDown,
  Plus,
  Edit,
  Trash2,
  BarChart3,
  Activity,
  Eye,
} from "lucide-react"
import { formatRupiah } from "@/lib/excel-export"
import { getSharedOrders, getSharedTables, initializeSharedData } from "@/lib/shared-data"
import { SidebarDemoInfo } from "@/components/sidebar-demo-info"

// Mock data with more comprehensive information
const mockStock = [
  { id: 1, name: "Burger", category: "Main", currentStock: 25, minStock: 10, maxStock: 50, price: 45000, cost: 30000 },
  { id: 2, name: "Pizza", category: "Main", currentStock: 15, minStock: 8, maxStock: 30, price: 85000, cost: 55000 },
  {
    id: 3,
    name: "Salad",
    category: "Appetizer",
    currentStock: 30,
    minStock: 15,
    maxStock: 40,
    price: 35000,
    cost: 20000,
  },
  {
    id: 4,
    name: "Coffee",
    category: "Beverage",
    currentStock: 50,
    minStock: 20,
    maxStock: 100,
    price: 15000,
    cost: 8000,
  },
  { id: 5, name: "Cake", category: "Dessert", currentStock: 12, minStock: 5, maxStock: 25, price: 25000, cost: 15000 },
]

const mockStockMovements = [
  { id: 1, item: "Burger", type: "in", quantity: 20, date: "2024-01-15", time: "09:00 AM", reason: "New delivery" },
  { id: 2, item: "Coffee", type: "out", quantity: 5, date: "2024-01-15", time: "10:30 AM", reason: "Sale" },
  { id: 3, item: "Pizza", type: "in", quantity: 10, date: "2024-01-14", time: "08:00 AM", reason: "Restock" },
]

export default function OwnerDashboard() {
  const [stock, setStock] = useState(mockStock)
  const [stockMovements, setStockMovements] = useState(mockStockMovements)
  const [reportType, setReportType] = useState("daily")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [isAddStockOpen, setIsAddStockOpen] = useState(false)
  const [newStockItem, setNewStockItem] = useState({
    name: "",
    category: "",
    quantity: "",
    price: "",
    cost: "",
  })
  const [username, setUsername] = useState("")

  // Use sidebar toggle hook
  const { isHidden } = useSidebarToggle()

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUsername(localStorage.getItem("username") || "Owner")
      // Initialize shared data
      initializeSharedData()
    }
  }, [])

  const handleLogout = () => {
    // Record logout time
    const loginHistory = JSON.parse(localStorage.getItem("loginHistory") || "[]")
    const currentSession = loginHistory.find((session: any) => !session.logoutTime && session.username === username)

    if (currentSession) {
      currentSession.logoutTime = new Date().toISOString()
      localStorage.setItem("loginHistory", JSON.stringify(loginHistory))
    }

    localStorage.removeItem("userRole")
    localStorage.removeItem("username")
    window.location.href = "/"
  }

  const getFilteredOrders = () => {
    const orders = getSharedOrders()
    const today = new Date().toISOString().split("T")[0]
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    switch (reportType) {
      case "daily":
        return orders.filter((order) => order.date === today)
      case "monthly":
        return orders.filter((order) => {
          const orderDate = new Date(order.date)
          return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear
        })
      case "yearly":
        return orders.filter((order) => {
          const orderDate = new Date(order.date)
          return orderDate.getFullYear() === currentYear
        })
      case "custom":
        if (startDate && endDate) {
          return orders.filter((order) => order.date >= startDate && order.date <= endDate)
        }
        return orders
      default:
        return orders
    }
  }

  const exportReport = () => {
    const filteredOrders = getFilteredOrders()
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Order ID,Table,Items,Total,Status,Time,Date,Cashier,Payment Method\n" +
      filteredOrders
        .map(
          (order) =>
            `${order.id},${order.table},"${order.items.join(", ")}",${order.total},${order.status},${order.time},${order.date},${order.cashier},${order.paymentMethod || "Cash"}`,
        )
        .join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${reportType}-report-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const addStock = () => {
    if (newStockItem.name && newStockItem.category && newStockItem.quantity) {
      const newItem = {
        id: stock.length + 1,
        name: newStockItem.name,
        category: newStockItem.category,
        currentStock: Number.parseInt(newStockItem.quantity),
        minStock: 10,
        maxStock: 50,
        price: Number.parseFloat(newStockItem.price) || 0,
        cost: Number.parseFloat(newStockItem.cost) || 0,
      }
      setStock((prev) => [...prev, newItem])

      // Add stock movement
      const movement = {
        id: stockMovements.length + 1,
        item: newStockItem.name,
        type: "in",
        quantity: Number.parseInt(newStockItem.quantity),
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        reason: "New item added",
      }
      setStockMovements((prev) => [...prev, movement])

      setNewStockItem({ name: "", category: "", quantity: "", price: "", cost: "" })
      setIsAddStockOpen(false)
    }
  }

  const updateStock = (itemId, newQuantity, reason = "Manual adjustment") => {
    setStock((prev) => prev.map((item) => (item.id === itemId ? { ...item, currentStock: newQuantity } : item)))

    const item = stock.find((s) => s.id === itemId)
    if (item) {
      const movement = {
        id: stockMovements.length + 1,
        item: item.name,
        type: newQuantity > item.currentStock ? "in" : "out",
        quantity: Math.abs(newQuantity - item.currentStock),
        date: new Date().toISOString().split("T")[0],
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        reason,
      }
      setStockMovements((prev) => [...prev, movement])
    }
  }

  const deleteStock = (itemId) => {
    setStock((prev) => prev.filter((item) => item.id !== itemId))
  }

  const filteredOrders = getFilteredOrders()
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0)
  const totalOrders = filteredOrders.length
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  return (
    <SidebarProvider>
      <AppSidebar userRole="owner" />
      <SidebarToggleButton />
      <SidebarDemoInfo />
      <SidebarInset
        className={`transition-all duration-300 ease-in-out ${isHidden ? "ml-0" : "ml-64"}`}
        style={{
          marginLeft: isHidden ? "0" : "var(--sidebar-width, 16rem)",
        }}
      >
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          {!isHidden && <SidebarTrigger className="-ml-1" />}
          <div className="flex items-center gap-3">
            <Store className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-semibold">Owner Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {username}</p>
            </div>
          </div>
        </header>

        <div className="p-6">
          <Tabs defaultValue="live-dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="live-dashboard" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Live Dashboard
              </TabsTrigger>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="stock">Stock</TabsTrigger>
              <TabsTrigger value="movements">Stock Movements</TabsTrigger>
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="live-dashboard" className="space-y-6">
              <LiveDashboardStats userRole="owner" />
            </TabsContent>

            <TabsContent value="overview" className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Today's Revenue</p>
                        <p className="text-2xl font-bold">
                          {formatRupiah(
                            getSharedOrders()
                              .filter((o) => o.date === new Date().toISOString().split("T")[0])
                              .reduce((sum, order) => sum + order.total, 0),
                          )}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Orders</p>
                        <p className="text-2xl font-bold">{getSharedOrders().length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-orange-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Low Stock Items</p>
                        <p className="text-2xl font-bold">
                          {stock.filter((item) => item.currentStock <= item.minStock).length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Active Tables</p>
                        <p className="text-2xl font-bold">
                          {getSharedTables().filter((table) => table.status === "occupied").length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders (Live)</CardTitle>
                  <CardDescription>Latest transactions from all cashiers</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Cashier</TableHead>
                        <TableHead>Table</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Subtotal</TableHead>
                        <TableHead>Tax</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getSharedOrders()
                        .slice(-5)
                        .reverse()
                        .map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>#{order.id}</TableCell>
                            <TableCell>{order.cashier}</TableCell>
                            <TableCell>{order.table}</TableCell>
                            <TableCell>{order.items.join(", ")}</TableCell>
                            <TableCell>{formatRupiah(order.subtotal)}</TableCell>
                            <TableCell>{formatRupiah(order.taxAndService)}</TableCell>
                            <TableCell>{formatRupiah(order.total)}</TableCell>
                            <TableCell>
                              <Badge variant={order.paymentMethod === "Cash" ? "secondary" : "default"}>
                                {order.paymentMethod || "Cash"}
                              </Badge>
                            </TableCell>
                            <TableCell>{order.date}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Rest of the tabs content remains the same... */}
            <TabsContent value="orders" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order Management (Live)</CardTitle>
                  <CardDescription>View and manage all orders in real-time</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Cashier</TableHead>
                        <TableHead>Table</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Subtotal</TableHead>
                        <TableHead>Tax</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getSharedOrders().map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>#{order.id}</TableCell>
                          <TableCell>{order.cashier}</TableCell>
                          <TableCell>{order.table}</TableCell>
                          <TableCell>{order.items.join(", ")}</TableCell>
                          <TableCell>{formatRupiah(order.subtotal)}</TableCell>
                          <TableCell>{formatRupiah(order.taxAndService)}</TableCell>
                          <TableCell>{formatRupiah(order.total)}</TableCell>
                          <TableCell>
                            <Badge variant={order.paymentMethod === "Cash" ? "secondary" : "default"}>
                              {order.paymentMethod || "Cash"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="default">{order.status}</Badge>
                          </TableCell>
                          <TableCell>{order.date}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Continue with other tabs... I'll keep the rest the same for brevity */}
            <TabsContent value="reports" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Sales Reports (Live Data)</CardTitle>
                    <CardDescription>Generate comprehensive sales reports from live data</CardDescription>
                  </div>
                  <Button onClick={exportReport}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-wrap gap-4">
                    <div className="space-y-2">
                      <Label>Report Type</Label>
                      <Select value={reportType} onValueChange={setReportType}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                          <SelectItem value="custom">Custom Range</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {reportType === "custom" && (
                      <>
                        <div className="space-y-2">
                          <Label>Start Date</Label>
                          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label>End Date</Label>
                          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                      </>
                    )}
                  </div>

                  {/* Report Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="text-sm text-muted-foreground">Total Revenue</p>
                            <p className="text-2xl font-bold">{formatRupiah(totalRevenue)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-sm text-muted-foreground">Total Orders</p>
                            <p className="text-2xl font-bold">{totalOrders}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-purple-600" />
                          <div>
                            <p className="text-sm text-muted-foreground">Avg Order Value</p>
                            <p className="text-2xl font-bold">{formatRupiah(avgOrderValue)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Cashier</TableHead>
                        <TableHead>Table</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Subtotal</TableHead>
                        <TableHead>Tax</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>#{order.id}</TableCell>
                          <TableCell>{order.cashier}</TableCell>
                          <TableCell>{order.table}</TableCell>
                          <TableCell>{order.items.join(", ")}</TableCell>
                          <TableCell>{formatRupiah(order.subtotal)}</TableCell>
                          <TableCell>{formatRupiah(order.taxAndService)}</TableCell>
                          <TableCell>{formatRupiah(order.total)}</TableCell>
                          <TableCell>
                            <Badge variant={order.paymentMethod === "Cash" ? "secondary" : "default"}>
                              {order.paymentMethod || "Cash"}
                            </Badge>
                          </TableCell>
                          <TableCell>{order.date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* I'll keep the rest of the tabs the same for brevity - stock, movements, analysis */}
            <TabsContent value="stock" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Stock Management</CardTitle>
                    <CardDescription>Manage inventory levels</CardDescription>
                  </div>
                  <Dialog open={isAddStockOpen} onOpenChange={setIsAddStockOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Stock
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Stock Item</DialogTitle>
                        <DialogDescription>Add a new item to your inventory</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Item Name</Label>
                          <Input
                            value={newStockItem.name}
                            onChange={(e) => setNewStockItem((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter item name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select
                            value={newStockItem.category}
                            onValueChange={(value) => setNewStockItem((prev) => ({ ...prev, category: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Main">Main</SelectItem>
                              <SelectItem value="Appetizer">Appetizer</SelectItem>
                              <SelectItem value="Beverage">Beverage</SelectItem>
                              <SelectItem value="Dessert">Dessert</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Quantity</Label>
                            <Input
                              type="number"
                              value={newStockItem.quantity}
                              onChange={(e) => setNewStockItem((prev) => ({ ...prev, quantity: e.target.value }))}
                              placeholder="0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Price</Label>
                            <Input
                              type="number"
                              step="1000"
                              value={newStockItem.price}
                              onChange={(e) => setNewStockItem((prev) => ({ ...prev, price: e.target.value }))}
                              placeholder="0"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Cost</Label>
                          <Input
                            type="number"
                            step="1000"
                            value={newStockItem.cost}
                            onChange={(e) => setNewStockItem((prev) => ({ ...prev, cost: e.target.value }))}
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddStockOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={addStock}>Add Item</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Min Stock</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stock.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.currentStock}
                              onChange={(e) => updateStock(item.id, Number.parseInt(e.target.value) || 0)}
                              className="w-20"
                            />
                          </TableCell>
                          <TableCell>{item.minStock}</TableCell>
                          <TableCell>{formatRupiah(item.price)}</TableCell>
                          <TableCell>{formatRupiah(item.cost)}</TableCell>
                          <TableCell>
                            <Badge variant={item.currentStock > item.minStock ? "default" : "destructive"}>
                              {item.currentStock > item.minStock ? "Good" : "Low"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => deleteStock(item.id)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="movements" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Stock Movements</CardTitle>
                  <CardDescription>Track all stock in and out movements</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stockMovements.map((movement) => (
                        <TableRow key={movement.id}>
                          <TableCell className="font-medium">{movement.item}</TableCell>
                          <TableCell>
                            <Badge variant={movement.type === "in" ? "default" : "secondary"}>
                              {movement.type === "in" ? "Stock In" : "Stock Out"}
                            </Badge>
                          </TableCell>
                          <TableCell>{movement.quantity}</TableCell>
                          <TableCell>{movement.date}</TableCell>
                          <TableCell>{movement.time}</TableCell>
                          <TableCell>{movement.reason}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Sales Analysis (Live)</CardTitle>
                    <CardDescription>Revenue and profit analysis from live data</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium">Total Revenue</span>
                      <span className="text-lg font-bold text-green-600">
                        {formatRupiah(getSharedOrders().reduce((sum, order) => sum + order.total, 0))}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-sm font-medium">Estimated Profit</span>
                      <span className="text-lg font-bold text-blue-600">
                        {formatRupiah(getSharedOrders().reduce((sum, order) => sum + order.total, 0) * 0.3)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium">Profit Margin</span>
                      <span className="text-lg font-bold text-purple-600">30%</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Stock Analysis</CardTitle>
                    <CardDescription>Inventory insights</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="text-sm font-medium">Total Items</span>
                      <span className="text-lg font-bold text-orange-600">{stock.length}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                      <span className="text-sm font-medium">Low Stock Items</span>
                      <span className="text-lg font-bold text-red-600">
                        {stock.filter((item) => item.currentStock <= item.minStock).length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">Total Stock Value</span>
                      <span className="text-lg font-bold text-gray-600">
                        {formatRupiah(stock.reduce((sum, item) => sum + item.currentStock * item.cost, 0))}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Detailed Analysis Report (Live)</CardTitle>
                    <CardDescription>Comprehensive business insights from real-time data</CardDescription>
                  </div>
                  <Button onClick={exportReport}>
                    <FileDown className="h-4 w-4 mr-2" />
                    Export Analysis
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Top Selling Items (Live Data)</h3>
                      <div className="space-y-2">
                        {(() => {
                          const itemCounts = {}
                          getSharedOrders().forEach((order) => {
                            order.items.forEach((item) => {
                              const itemName = item.split(" x")[0]
                              itemCounts[itemName] = (itemCounts[itemName] || 0) + 1
                            })
                          })

                          return Object.entries(itemCounts)
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 5)
                            .map(([item, count], index) => (
                              <div key={item} className="flex justify-between items-center p-2 border rounded">
                                <span className="font-medium">
                                  #{index + 1} {item}
                                </span>
                                <Badge variant="secondary">{count} sold</Badge>
                              </div>
                            ))
                        })()}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3">Peak Hours</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-muted-foreground">Morning</p>
                          <p className="text-lg font-bold">8AM - 12PM</p>
                          <p className="text-sm">35% of sales</p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-muted-foreground">Afternoon</p>
                          <p className="text-lg font-bold">12PM - 6PM</p>
                          <p className="text-sm">45% of sales</p>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                          <p className="text-sm text-muted-foreground">Evening</p>
                          <p className="text-lg font-bold">6PM - 10PM</p>
                          <p className="text-sm">20% of sales</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
