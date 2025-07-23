"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Banknote, QrCode, CheckCircle } from "lucide-react"
import { formatRupiah } from "@/lib/excel-export"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onPaymentComplete: (paymentMethod: string, amountPaid?: number, change?: number) => void
  orderTotal: number
  orderSubtotal?: number
  taxAndService?: number
  orderItems: any[]
  selectedTable: string
}

export function PaymentModal({
  isOpen,
  onClose,
  onPaymentComplete,
  orderTotal,
  orderSubtotal = 0,
  taxAndService = 0,
  orderItems,
  selectedTable,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState("")
  const [cashAmount, setCashAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [qrisStatus, setQrisStatus] = useState("waiting") // waiting, processing, completed

  const cashAmountNum = Number.parseFloat(cashAmount) || 0
  const change = cashAmountNum - orderTotal

  const handleCashPayment = () => {
    if (cashAmountNum >= orderTotal) {
      setIsProcessing(true)
      setTimeout(() => {
        onPaymentComplete("Cash", cashAmountNum, change)
        setIsProcessing(false)
        onClose()
        resetForm()
      }, 1000)
    }
  }

  const handleQRISPayment = () => {
    setQrisStatus("processing")
    setIsProcessing(true)

    // Simulate QRIS payment process
    setTimeout(() => {
      setQrisStatus("completed")
      setTimeout(() => {
        onPaymentComplete("QRIS", orderTotal, 0)
        setIsProcessing(false)
        setQrisStatus("waiting")
        onClose()
        resetForm()
      }, 1500)
    }, 3000)
  }

  const resetForm = () => {
    setPaymentMethod("")
    setCashAmount("")
    setQrisStatus("waiting")
  }

  const handleClose = () => {
    if (!isProcessing) {
      onClose()
      resetForm()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Payment</DialogTitle>
          <DialogDescription>Choose payment method and complete the transaction</DialogDescription>
        </DialogHeader>

        {/* Order Summary */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <h3 className="font-semibold mb-2">Order Summary</h3>
          <p className="text-sm text-muted-foreground mb-1">Table: {selectedTable}</p>
          <p className="text-sm text-muted-foreground mb-2">Items: {orderItems.length}</p>

          <div className="space-y-1 mb-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>{formatRupiah(orderSubtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax & Service (11%):</span>
              <span>{formatRupiah(taxAndService)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
            <span>Total:</span>
            <span>{formatRupiah(orderTotal)}</span>
          </div>
        </div>

        <Tabs value={paymentMethod} onValueChange={setPaymentMethod} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cash" className="flex items-center gap-2">
              <Banknote className="h-4 w-4" />
              Cash
            </TabsTrigger>
            <TabsTrigger value="qris" className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              QRIS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cash" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cashAmount">Cash Amount</Label>
              <Input
                id="cashAmount"
                type="number"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                placeholder="Enter cash amount"
                disabled={isProcessing}
              />
            </div>

            {cashAmountNum > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Amount Paid:</span>
                  <span>{formatRupiah(cashAmountNum)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span>{formatRupiah(orderTotal)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Change:</span>
                  <span className={change >= 0 ? "text-green-600" : "text-red-600"}>
                    {formatRupiah(Math.max(0, change))}
                  </span>
                </div>
                {change < 0 && <p className="text-sm text-red-600">Insufficient amount</p>}
              </div>
            )}

            <Button
              onClick={handleCashPayment}
              className="w-full"
              disabled={cashAmountNum < orderTotal || isProcessing}
            >
              {isProcessing ? "Processing..." : "Complete Cash Payment"}
            </Button>
          </TabsContent>

          <TabsContent value="qris" className="space-y-4">
            <div className="text-center space-y-4">
              {qrisStatus === "waiting" && (
                <>
                  <div className="w-48 h-48 mx-auto bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <QrCode className="h-16 w-16 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">QR Code will appear here</p>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold">Scan QR Code to Pay</p>
                    <p className="text-sm text-muted-foreground">Amount: {formatRupiah(orderTotal)}</p>
                  </div>
                </>
              )}

              {qrisStatus === "processing" && (
                <>
                  <div className="w-48 h-48 mx-auto bg-blue-50 border-2 border-blue-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-2"></div>
                      <p className="text-sm text-blue-600">Processing Payment...</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="animate-pulse">
                    Waiting for payment confirmation
                  </Badge>
                </>
              )}

              {qrisStatus === "completed" && (
                <>
                  <div className="w-48 h-48 mx-auto bg-green-50 border-2 border-green-200 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <CheckCircle className="h-16 w-16 mx-auto mb-2 text-green-600" />
                      <p className="text-sm text-green-600">Payment Successful!</p>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-green-600">
                    Payment Completed
                  </Badge>
                </>
              )}
            </div>

            {qrisStatus === "waiting" && (
              <Button onClick={handleQRISPayment} className="w-full" disabled={isProcessing}>
                Generate QR Code & Process Payment
              </Button>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
