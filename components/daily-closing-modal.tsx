"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileDown, TrendingUp, ShoppingCart, Users, Calendar } from "lucide-react"
import { formatRupiah, exportDailyReportToExcel } from "@/lib/excel-export"

interface DailyClosingModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirmClosing: () => void
  todayOrders: any[]
  date: string
}

export function DailyClosingModal({ isOpen, onClose, onConfirmClosing, todayOrders, date }: DailyClosingModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const totalRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0)
  const totalOrders = todayOrders.length
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  // Payment method breakdown
  const cashOrders = todayOrders.filter((order) => order.paymentMethod === "Cash")
  const qrisOrders = todayOrders.filter((order) => order.paymentMethod === "QRIS")
  const cashTotal = cashOrders.reduce((sum, order) => sum + order.total, 0)
  const qrisTotal = qrisOrders.reduce((sum, order) => sum + order.total, 0)

  const handleExportAndClose = async () => {
    setIsProcessing(true)

    // Export current day's data
    const loginHistory = JSON.parse(localStorage.getItem("loginHistory") || "[]")
    exportDailyReportToExcel(todayOrders, loginHistory, date)

    // Wait a bit for export to complete
    setTimeout(() => {
      onConfirmClosing()
      setIsProcessing(false)
      onClose()
    }, 2000)
  }

  const handleExportOnly = () => {
    const loginHistory = JSON.parse(localStorage.getItem("loginHistory") || "[]")
    exportDailyReportToExcel(todayOrders, loginHistory, date)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daily Closing - {new Date(date).toLocaleDateString()}
          </DialogTitle>
          <DialogDescription>
            Review today's performance and close the day. This will archive today's data and start fresh for tomorrow.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
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
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Order</p>
                    <p className="text-2xl font-bold">{formatRupiah(avgOrderValue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Method Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Cash</Badge>
                  <span className="text-sm text-muted-foreground">{cashOrders.length} orders</span>
                </div>
                <span className="font-semibold">{formatRupiah(cashTotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Badge variant="default">QRIS</Badge>
                  <span className="text-sm text-muted-foreground">{qrisOrders.length} orders</span>
                </div>
                <span className="font-semibold">{formatRupiah(qrisTotal)}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center font-bold">
                <span>Total Revenue:</span>
                <span>{formatRupiah(totalRevenue)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Top Selling Items */}
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* Calculate top items from orders */}
                {(() => {
                  const itemCounts = {}
                  todayOrders.forEach((order) => {
                    order.items.forEach((item) => {
                      const itemName = item.split(" x")[0]
                      itemCounts[itemName] = (itemCounts[itemName] || 0) + 1
                    })
                  })

                  return Object.entries(itemCounts)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 5)
                    .map(([item, count], index) => (
                      <div key={item} className="flex justify-between items-center">
                        <span className="font-medium">
                          #{index + 1} {item}
                        </span>
                        <Badge variant="outline">{count} sold</Badge>
                      </div>
                    ))
                })()}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={handleExportOnly} className="flex-1 bg-transparent">
              <FileDown className="h-4 w-4 mr-2" />
              Export Only
            </Button>
            <Button onClick={handleExportAndClose} className="flex-1" disabled={isProcessing}>
              <FileDown className="h-4 w-4 mr-2" />
              {isProcessing ? "Processing..." : "Export & Close Day"}
            </Button>
          </div>

          <div className="text-sm text-muted-foreground bg-yellow-50 p-3 rounded-lg">
            <strong>Note:</strong> Closing the day will:
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Export today's complete report to Excel</li>
              <li>Archive all today's data</li>
              <li>Reset daily counters for tomorrow</li>
              <li>This action cannot be undone</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
