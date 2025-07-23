"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ShoppingCart,
  Users,
  TrendingUp,
  FileDown,
  Plus,
  Minus,
  Utensils,
  Coffee,
  Calendar,
  Search,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar, useSidebarToggle } from "@/components/app-sidebar"
import { SidebarToggleButton } from "@/components/sidebar-toggle-button"
import { PaymentModal } from "@/components/payment-modal"
import { mockMenu, mockStock } from "@/lib/mock-data"
import { exportDailyReportToExcel, formatRupiah } from "@/lib/excel-export"
import { DailyClosingModal } from "@/components/daily-closing-modal"
import { TableStatusManager } from "@/components/table-status-manager"
import {
  getSharedOrders,
  getSharedTables,
  addSharedOrder,
  updateTableStatus,
  initializeSharedData,
} from "@/lib/shared-data"
import { Input } from "@/components/ui/input"
import { BillTemplate } from "@/components/bill-template"

// Add this import at the top
import { SidebarDemoInfo } from "@/components/sidebar-demo-info"

export default function CashierDashboard() {
  const [currentOrder, setCurrentOrder] = useState([])
  const [selectedTable, setSelectedTable] = useState("")
  const [username, setUsername] = useState("")
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [menuCategory, setMenuCategory] = useState("all")
  const [isClosingModalOpen, setIsClosingModalOpen] = useState(false)
  const [closedDays, setClosedDays] = useState([])

  // Add these state variables after the existing useState declarations
  const [searchQuery, setSearchQuery] = useState("")
  const [showBillPreview, setShowBillPreview] = useState(false)
  const [currentBill, setCurrentBill] = useState(null)

  // Use shared data
  const [orders, setOrders] = useState([])
  const [tables, setTables] = useState([])

  // Use sidebar toggle hook
  const { isHidden } = useSidebarToggle()

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUsername(localStorage.getItem("username") || "Cashier")
      // Initialize shared data
      initializeSharedData()
      // Load initial data
      setOrders(getSharedOrders())
      setTables(getSharedTables())
    }
  }, [])

  // Listen for real-time updates
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "pos_orders") {
        setOrders(getSharedOrders())
      }
      if (e.key === "pos_tables") {
        setTables(getSharedTables())
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  // Separate food and drink items
  const foodItems = mockMenu.filter((item) => ["Main", "Appetizer", "Dessert"].includes(item.category))
  const drinkItems = mockMenu.filter((item) => item.category === "Beverage")

  const getFilteredMenu = () => {
    switch (menuCategory) {
      case "food":
        return foodItems
      case "drinks":
        return drinkItems
      default:
        return mockMenu
    }
  }

  const addToOrder = (item) => {
    setCurrentOrder((prev) => {
      const existing = prev.find((orderItem) => orderItem.id === item.id)
      if (existing) {
        return prev.map((orderItem) =>
          orderItem.id === item.id ? { ...orderItem, quantity: orderItem.quantity + 1 } : orderItem,
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeFromOrder = (itemId) => {
    setCurrentOrder((prev) => {
      return prev
        .map((item) => (item.id === itemId && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item))
        .filter((item) => item.quantity > 0)
    })
  }

  const getTotalAmount = () => {
    return currentOrder.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  // Add this function after getTotalAmount()
  const getSubtotal = () => {
    return currentOrder.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getTaxAndService = () => {
    const subtotal = getSubtotal()
    return subtotal * 0.11 // 11% tax and service
  }

  const getFinalTotal = () => {
    return getSubtotal() + getTaxAndService()
  }

  // Add this function to filter menu items based on search
  const getFilteredMenuWithSearch = () => {
    let filteredMenu = getFilteredMenu()

    if (searchQuery.trim()) {
      filteredMenu = filteredMenu.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    return filteredMenu
  }

  // Table status management
  const handleTableStatusChange = (tableId: number, newStatus: string) => {
    updateTableStatus(tableId, newStatus)
    setTables(getSharedTables()) // Refresh local state
  }

  // Update table status when order is completed
  const handlePaymentComplete = (paymentMethod: string, amountPaid?: number, change?: number) => {
    const subtotal = getSubtotal()
    const taxAndService = getTaxAndService()
    const finalTotal = getFinalTotal()

    const newOrder = {
      id: Date.now(),
      table: selectedTable,
      items: currentOrder.map((item) => `${item.name} x${item.quantity}`),
      subtotal: subtotal,
      taxAndService: taxAndService,
      total: finalTotal,
      status: "completed",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      date: new Date().toISOString().split("T")[0],
      cashier: username,
      paymentMethod,
      amountPaid,
      change,
    }

    // Generate bill before clearing order
    const bill = {
      ...newOrder,
      orderItems: [...currentOrder],
      customerCopy: true,
    }
    setCurrentBill(bill)

    // Add to shared storage
    addSharedOrder(newOrder)
    setOrders(getSharedOrders())

    // Update table status to occupied
    const tableToUpdate = tables.find((t) => t.name === selectedTable)
    if (tableToUpdate) {
      handleTableStatusChange(tableToUpdate.id, "occupied")
    }

    // Show bill preview
    setShowBillPreview(true)

    setCurrentOrder([])
    setSelectedTable("")
  }

  // Daily closing function
  const handleDailyClosing = () => {
    const today = new Date().toISOString().split("T")[0]
    const todayOrders = orders.filter((order) => order.date === today)

    // Store closed day data
    const closedDay = {
      date: today,
      orders: todayOrders,
      totalRevenue: todayOrders.reduce((sum, order) => sum + order.total, 0),
      totalOrders: todayOrders.length,
    }

    setClosedDays((prev) => [...prev, closedDay])

    // Remove today's orders from active orders (simulate database archiving)
    const remainingOrders = orders.filter((order) => order.date !== today)
    setOrders(remainingOrders)

    // Reset all tables to available
    tables.forEach((table) => {
      handleTableStatusChange(table.id, "available")
    })
  }

  // Filter orders to exclude closed days
  const activeOrders = orders.filter((order) => !closedDays.some((closedDay) => closedDay.date === order.date))

  const exportDailyReport = () => {
    const todayOrders = orders.filter((order) => order.date === new Date().toISOString().split("T")[0])
    const loginHistory = JSON.parse(localStorage.getItem("loginHistory") || "[]")
    exportDailyReportToExcel(todayOrders, loginHistory, new Date().toISOString().split("T")[0])
  }

  const todayOrders = activeOrders.filter((order) => order.date === new Date().toISOString().split("T")[0])
  const totalRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0)

  // Add this component before the closing </SidebarProvider> tag
  return (
    <SidebarProvider>
      <AppSidebar userRole="cashier" />
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
            <div>
              <h1 className="text-xl font-semibold">Cashier Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {username}</p>
            </div>
          </div>
        </header>

        <div className="p-6">
          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="orders">New Order</TabsTrigger>
              <TabsTrigger value="daily-report">Daily Report</TabsTrigger>
              <TabsTrigger value="stock">Stock View</TabsTrigger>
              <TabsTrigger value="tables">Tables</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Menu Items */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Menu Items</CardTitle>
                      <CardDescription>Select items to add to order</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Search Input */}
                      <div className="mb-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            placeholder="Search menu items..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      {/* Menu Category Filter */}
                      <div className="mb-4">
                        <Tabs value={menuCategory} onValueChange={setMenuCategory}>
                          <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="all">All Items</TabsTrigger>
                            <TabsTrigger value="food" className="flex items-center gap-2">
                              <Utensils className="h-4 w-4" />
                              Food
                            </TabsTrigger>
                            <TabsTrigger value="drinks" className="flex items-center gap-2">
                              <Coffee className="h-4 w-4" />
                              Drinks
                            </TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {getFilteredMenuWithSearch().map((item) => (
                          <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-medium">{item.name}</h3>
                              <Badge variant="secondary">{item.category}</Badge>
                            </div>
                            <p className="text-2xl font-bold text-primary mb-2">{formatRupiah(item.price)}</p>
                            <p className="text-sm text-muted-foreground mb-3">Stock: {item.stock}</p>
                            <Button onClick={() => addToOrder(item)} className="w-full" disabled={item.stock === 0}>
                              <Plus className="h-4 w-4 mr-2" />
                              Add to Order
                            </Button>
                          </div>
                        ))}
                        {getFilteredMenuWithSearch().length === 0 && (
                          <div className="col-span-2 text-center py-8 text-muted-foreground">
                            No items found matching "{searchQuery}"
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Current Order */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Current Order</CardTitle>
                      <CardDescription>Review and complete order</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Select Table</Label>
                        <Select value={selectedTable} onValueChange={setSelectedTable}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose table" />
                          </SelectTrigger>
                          <SelectContent>
                            {tables
                              .filter((table) => table.status === "available")
                              .map((table) => (
                                <SelectItem key={table.id} value={table.name}>
                                  {table.name} (Capacity: {table.capacity})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Order Items</Label>
                        {currentOrder.length === 0 ? (
                          <p className="text-muted-foreground text-sm">No items added</p>
                        ) : (
                          <div className="space-y-2">
                            {currentOrder.map((item) => (
                              <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                                <div>
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {formatRupiah(item.price)} x {item.quantity}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button size="sm" variant="outline" onClick={() => removeFromOrder(item.id)}>
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="w-8 text-center">{item.quantity}</span>
                                  <Button size="sm" variant="outline" onClick={() => addToOrder(item)}>
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {currentOrder.length > 0 && (
                        <div className="border-t pt-4 space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span>Subtotal:</span>
                            <span>{formatRupiah(getSubtotal())}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span>Tax & Service (11%):</span>
                            <span>{formatRupiah(getTaxAndService())}</span>
                          </div>
                          <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                            <span>Total:</span>
                            <span>{formatRupiah(getFinalTotal())}</span>
                          </div>
                          <Button
                            onClick={() => setIsPaymentModalOpen(true)}
                            className="w-full"
                            disabled={!selectedTable}
                          >
                            Proceed to Payment
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="daily-report" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Daily Report (Live)</CardTitle>
                    <CardDescription>
                      Today's sales summary - {new Date().toLocaleDateString()} • Updates in real-time
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsClosingModalOpen(true)}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Close Day
                    </Button>
                    <Button onClick={exportDailyReport}>
                      <FileDown className="h-4 w-4 mr-2" />
                      Export to Excel
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <ShoppingCart className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Total Orders</p>
                            <p className="text-2xl font-bold">{todayOrders.length}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="text-sm text-muted-foreground">Total Sales</p>
                            <p className="text-2xl font-bold">{formatRupiah(totalRevenue)}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-sm text-muted-foreground">Avg Order</p>
                            <p className="text-2xl font-bold">
                              {formatRupiah(todayOrders.length > 0 ? totalRevenue / todayOrders.length : 0)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>User/Cashier</TableHead>
                        <TableHead>Table</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total per Order</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {todayOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>#{order.id}</TableCell>
                          <TableCell>{order.cashier}</TableCell>
                          <TableCell>{order.table}</TableCell>
                          <TableCell>{order.items.join(", ")}</TableCell>
                          <TableCell>{formatRupiah(order.total)}</TableCell>
                          <TableCell>
                            <Badge variant={order.paymentMethod === "Cash" ? "secondary" : "default"}>
                              {order.paymentMethod || "Cash"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={order.status === "completed" ? "default" : "secondary"}>
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{order.time}</TableCell>
                        </TableRow>
                      ))}
                      {/* Daily Closing Summary */}
                      <TableRow className="border-t-2 border-primary">
                        <TableCell colSpan={5} className="font-bold text-right">
                          DAILY CLOSING SUMMARY:
                        </TableCell>
                        <TableCell className="font-bold">{formatRupiah(totalRevenue)}</TableCell>
                        <TableCell className="font-bold">{todayOrders.length} Orders</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stock" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Stock Overview</CardTitle>
                  <CardDescription>Current inventory levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockStock.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{item.currentStock}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                item.currentStock > 20
                                  ? "default"
                                  : item.currentStock > 10
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {item.currentStock > 20 ? "Good" : item.currentStock > 10 ? "Low" : "Critical"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tables" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Table Management (Live)</CardTitle>
                  <CardDescription>
                    Current table status (7 tables available) - Updates in real-time across all devices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TableStatusManager tables={tables} onTableStatusChange={handleTableStatusChange} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Payment Modal */}
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onPaymentComplete={handlePaymentComplete}
          orderTotal={getFinalTotal()}
          orderSubtotal={getSubtotal()}
          taxAndService={getTaxAndService()}
          orderItems={currentOrder}
          selectedTable={selectedTable}
        />
        <DailyClosingModal
          isOpen={isClosingModalOpen}
          onClose={() => setIsClosingModalOpen(false)}
          onConfirmClosing={handleDailyClosing}
          todayOrders={todayOrders}
          date={new Date().toISOString().split("T")[0]}
        />
        {/* Bill Template Modal */}
        <BillTemplate isOpen={showBillPreview} onClose={() => setShowBillPreview(false)} bill={currentBill} />
      </SidebarInset>
    </SidebarProvider>
  )
}
