import * as XLSX from "xlsx"

export interface ExcelData {
  [key: string]: any
}

export function exportToExcel(data: ExcelData[], filename: string, sheetName = "Sheet1") {
  // Create a new workbook
  const workbook = XLSX.utils.book_new()

  // Convert data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(data)

  // Auto-size columns
  const colWidths = Object.keys(data[0] || {}).map((key) => ({
    wch: Math.max(key.length, ...data.map((row) => String(row[key] || "").length)) + 2,
  }))
  worksheet["!cols"] = colWidths

  // Add borders and formatting
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1")

  for (let row = range.s.r; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
      if (!worksheet[cellAddress]) continue

      worksheet[cellAddress].s = {
        border: {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        },
        font: row === 0 ? { bold: true } : {},
        fill: row === 0 ? { fgColor: { rgb: "E2E8F0" } } : {},
      }

      // Format currency columns for Rupiah
      if (
        typeof worksheet[cellAddress].v === "number" &&
        (String(worksheet[cellAddress].v).includes(".") ||
          ["total", "price", "amount", "revenue"].some((term) =>
            Object.keys(data[0] || {})
              [col]?.toLowerCase()
              .includes(term),
          ))
      ) {
        worksheet[cellAddress].z = '"Rp "#,##0'
      }
    }
  }

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)

  // Write the file using browser-compatible method
  try {
    XLSX.writeFile(workbook, `${filename}.xlsx`)
  } catch (error) {
    console.error("Error exporting to Excel:", error)
    // Fallback to CSV if Excel export fails
    exportToCSV(data, filename)
  }
}

// Fallback CSV export function
function exportToCSV(data: ExcelData[], filename: string) {
  const csvContent = [
    Object.keys(data[0] || {}).join(","),
    ...data.map((row) =>
      Object.values(row)
        .map((value) => (typeof value === "string" && value.includes(",") ? `"${value}"` : String(value)))
        .join(","),
    ),
  ].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportDailyReportToExcel(orders: any[], loginHistory: any[], date: string) {
  const reportData = orders.map((order) => ({
    "Order ID": `#${order.id}`,
    "User/Cashier": order.cashier || "System",
    Table: order.table,
    Items: order.items.join(", "),
    "Total per Order": order.total,
    Status: order.status,
    Time: order.time,
    Date: order.date,
  }))

  // Add summary row
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)

  reportData.push({
    "Order ID": "",
    "User/Cashier": "",
    Table: "",
    Items: "",
    "Total per Order": "",
    Status: "",
    Time: "",
    Date: "",
  })

  reportData.push({
    "Order ID": "DAILY CLOSING SUMMARY",
    "User/Cashier": "",
    Table: "",
    Items: "",
    "Total per Order": "",
    Status: "",
    Time: "",
    Date: "",
  })

  reportData.push({
    "Order ID": "Total Orders:",
    "User/Cashier": totalOrders,
    Table: "",
    Items: "",
    "Total per Order": "",
    Status: "",
    Time: "",
    Date: "",
  })

  reportData.push({
    "Order ID": "Total Revenue:",
    "User/Cashier": totalRevenue,
    Table: "",
    Items: "",
    "Total per Order": "",
    Status: "",
    Time: "",
    Date: "",
  })

  exportToExcel(reportData, `daily-report-${date}`, "Daily Report")
}

// Helper function to format currency in Rupiah
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
