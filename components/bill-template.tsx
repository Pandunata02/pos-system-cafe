"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Printer, Download, X } from "lucide-react"
import { formatRupiah } from "@/lib/excel-export"

interface BillTemplateProps {
  isOpen: boolean
  onClose: () => void
  bill: any
}

export function BillTemplate({ isOpen, onClose, bill }: BillTemplateProps) {
  if (!bill) return null

  const handlePrint = () => {
    const printContent = document.getElementById("bill-content")
    if (printContent) {
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Receipt - Order #${bill.id}</title>
              <style>
                body { 
                  font-family: 'Courier New', monospace; 
                  margin: 0; 
                  padding: 20px; 
                  font-size: 12px;
                  line-height: 1.4;
                }
                .receipt { 
                  max-width: 300px; 
                  margin: 0 auto; 
                  background: white;
                }
                .header { 
                  text-align: center; 
                  margin-bottom: 20px; 
                  border-bottom: 2px solid #000;
                  padding-bottom: 10px;
                }
                .company-name { 
                  font-size: 18px; 
                  font-weight: bold; 
                  margin-bottom: 5px;
                }
                .company-info { 
                  font-size: 10px; 
                  margin-bottom: 2px;
                }
                .order-info { 
                  margin-bottom: 15px; 
                  font-size: 11px;
                }
                .items { 
                  margin-bottom: 15px; 
                }
                .item { 
                  display: flex; 
                  justify-content: space-between; 
                  margin-bottom: 5px;
                  font-size: 11px;
                }
                .item-name { 
                  flex: 1; 
                }
                .item-qty { 
                  width: 30px; 
                  text-align: center; 
                }
                .item-price { 
                  width: 80px; 
                  text-align: right; 
                }
                .totals { 
                  border-top: 1px solid #000; 
                  padding-top: 10px; 
                  margin-top: 10px;
                }
                .total-line { 
                  display: flex; 
                  justify-content: space-between; 
                  margin-bottom: 5px;
                  font-size: 11px;
                }
                .final-total { 
                  font-weight: bold; 
                  font-size: 14px; 
                  border-top: 2px solid #000; 
                  padding-top: 5px; 
                  margin-top: 10px;
                }
                .payment-info { 
                  margin-top: 15px; 
                  padding-top: 10px; 
                  border-top: 1px dashed #000;
                  font-size: 11px;
                }
                .footer { 
                  text-align: center; 
                  margin-top: 20px; 
                  padding-top: 10px; 
                  border-top: 1px dashed #000;
                  font-size: 10px;
                }
                @media print {
                  body { margin: 0; padding: 10px; }
                  .receipt { max-width: none; }
                }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  const handleDownload = () => {
    const billData = `
RESTAURANT POS SYSTEM
Jl. Contoh No. 123, Jakarta
Tel: (021) 1234-5678
================================

Order #: ${bill.id}
Date: ${new Date(bill.date).toLocaleDateString("id-ID")}
Time: ${bill.time}
Table: ${bill.table}
Cashier: ${bill.cashier}
Payment: ${bill.paymentMethod}

================================
ITEMS:
${bill.orderItems
  .map(
    (item) =>
      `${item.name.padEnd(20)} ${item.quantity.toString().padStart(2)} ${formatRupiah(item.price * item.quantity).padStart(12)}`,
  )
  .join("\n")}

================================
Subtotal:     ${formatRupiah(bill.subtotal).padStart(12)}
Tax & Service (11%): ${formatRupiah(bill.taxAndService).padStart(6)}
--------------------------------
TOTAL:        ${formatRupiah(bill.total).padStart(12)}

Payment:      ${formatRupiah(bill.amountPaid || bill.total).padStart(12)}
Change:       ${formatRupiah(bill.change || 0).padStart(12)}

================================
Thank you for your visit!
Please come again!
================================
    `

    const blob = new Blob([billData], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `receipt-${bill.id}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Receipt - Order #{bill.id}</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div id="bill-content" className="receipt bg-white p-4 border">
          {/* Header */}
          <div className="header text-center mb-4 pb-3 border-b-2 border-black">
            <div className="company-name text-lg font-bold mb-1">RESTAURANT POS SYSTEM</div>
            <div className="company-info text-xs mb-1">Jl. Contoh No. 123, Jakarta</div>
            <div className="company-info text-xs mb-1">Tel: (021) 1234-5678</div>
            <div className="company-info text-xs">Email: info@restaurant.com</div>
          </div>

          {/* Order Information */}
          <div className="order-info mb-4 text-sm">
            <div className="flex justify-between mb-1">
              <span>Order #:</span>
              <span className="font-mono">#{bill.id}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Date:</span>
              <span>{new Date(bill.date).toLocaleDateString("id-ID")}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Time:</span>
              <span>{bill.time}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Table:</span>
              <span>{bill.table}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Cashier:</span>
              <span>{bill.cashier}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment:</span>
              <span>{bill.paymentMethod}</span>
            </div>
          </div>

          <Separator className="my-3" />

          {/* Items */}
          <div className="items mb-4">
            <div className="font-semibold mb-2 text-sm">ITEMS:</div>
            {bill.orderItems.map((item, index) => (
              <div key={index} className="flex justify-between items-center mb-2 text-sm">
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs text-gray-600">
                    {formatRupiah(item.price)} x {item.quantity}
                  </div>
                </div>
                <div className="font-mono text-right">{formatRupiah(item.price * item.quantity)}</div>
              </div>
            ))}
          </div>

          <Separator className="my-3" />

          {/* Totals */}
          <div className="totals">
            <div className="flex justify-between mb-2 text-sm">
              <span>Subtotal:</span>
              <span className="font-mono">{formatRupiah(bill.subtotal)}</span>
            </div>
            <div className="flex justify-between mb-2 text-sm">
              <span>Tax & Service (11%):</span>
              <span className="font-mono">{formatRupiah(bill.taxAndService)}</span>
            </div>

            <Separator className="my-2" />

            <div className="flex justify-between font-bold text-lg final-total border-t-2 border-black pt-2">
              <span>TOTAL:</span>
              <span className="font-mono">{formatRupiah(bill.total)}</span>
            </div>
          </div>

          {/* Payment Information */}
          <div className="payment-info mt-4 pt-3 border-t border-dashed border-gray-400">
            <div className="flex justify-between mb-1 text-sm">
              <span>Payment:</span>
              <span className="font-mono">{formatRupiah(bill.amountPaid || bill.total)}</span>
            </div>
            {bill.change > 0 && (
              <div className="flex justify-between mb-1 text-sm">
                <span>Change:</span>
                <span className="font-mono">{formatRupiah(bill.change)}</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="footer text-center mt-4 pt-3 border-t border-dashed border-gray-400 text-xs">
            <div className="mb-1">Thank you for your visit!</div>
            <div className="mb-1">Please come again!</div>
            <div className="text-xs text-gray-500">Printed: {new Date().toLocaleString("id-ID")}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <Button onClick={handlePrint} className="flex-1">
            <Printer className="h-4 w-4 mr-2" />
            Print Receipt
          </Button>
          <Button onClick={handleDownload} variant="outline" className="flex-1 bg-transparent">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>

        <div className="text-xs text-center text-gray-500 mt-2">Receipt can be printed or downloaded as text file</div>
      </DialogContent>
    </Dialog>
  )
}
