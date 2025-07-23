"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ShoppingCart, TrendingUp, Users, RefreshCw, Activity, Banknote, QrCode } from "lucide-react"
import { getDailyStats, getSharedTables } from "@/lib/shared-data"
import { formatRupiah } from "@/lib/excel-export"

interface LiveDashboardStatsProps {
  userRole: "cashier" | "owner"
}

export function LiveDashboardStats({ userRole }: LiveDashboardStatsProps) {
  const [stats, setStats] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshStats = () => {
    setIsRefreshing(true)
    const today = new Date().toISOString().split("T")[0]
    const newStats = getDailyStats(today)
    setStats(newStats)
    setLastUpdate(new Date())
    setTimeout(() => setIsRefreshing(false), 500)
  }

  useEffect(() => {
    // Initial load
    refreshStats()

    // Set up real-time updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "pos_orders") {
        refreshStats()
      }
    }

    window.addEventListener("storage", handleStorageChange)

    // Auto-refresh every 30 seconds
    const interval = setInterval(refreshStats, 30000)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  if (!stats) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Live Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()} • Auto-refresh every 30s
          </p>
        </div>
        <Button variant="outline" onClick={refreshStats} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Real-time Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Today's Orders</p>
                <p className="text-2xl font-bold">{stats.totalOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Today's Revenue</p>
                <p className="text-2xl font-bold">{formatRupiah(stats.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Order Value</p>
                <p className="text-2xl font-bold">{formatRupiah(stats.avgOrderValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
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

      {/* Payment Method Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5" />
              Cash Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Orders:</span>
                <Badge variant="secondary">{stats.cashOrders}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-semibold">{formatRupiah(stats.cashTotal)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              QRIS Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Orders:</span>
                <Badge variant="default">{stats.qrisOrders}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Total:</span>
                <span className="font-semibold">{formatRupiah(stats.qrisTotal)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders (Live)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Cashier</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Tax & Service</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.orders
                .slice(-10)
                .reverse()
                .map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>#{order.id}</TableCell>
                    <TableCell>{order.cashier}</TableCell>
                    <TableCell>{order.table}</TableCell>
                    <TableCell className="max-w-xs truncate">{order.items.join(", ")}</TableCell>
                    <TableCell>{formatRupiah(order.total)}</TableCell>
                    <TableCell>
                      <Badge variant={order.paymentMethod === "Cash" ? "secondary" : "default"}>
                        {order.paymentMethod || "Cash"}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.time}</TableCell>
                    <TableCell>{order.taxAndService ? formatRupiah(order.taxAndService) : "N/A"}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
