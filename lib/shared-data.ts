"use client"

// Shared data management system for real-time updates between cashier and owner
import { useState, useEffect } from "react"

export interface Order {
  id: number
  table: string
  items: string[]
  subtotal?: number
  taxAndService?: number
  total: number
  status: string
  time: string
  date: string
  cashier: string
  paymentMethod?: string
  amountPaid?: number
  change?: number
}

export interface Table {
  id: number
  name: string
  status: "available" | "occupied" | "reserved" | "cleaning"
  capacity: number
  currentOrder?: number
}

// Storage keys
const ORDERS_KEY = "pos_orders"
const TABLES_KEY = "pos_tables"
const DAILY_STATS_KEY = "pos_daily_stats"

// Get orders from shared storage
export const getSharedOrders = (): Order[] => {
  if (typeof window === "undefined") return []
  return JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]")
}

// Save orders to shared storage
export const saveSharedOrders = (orders: Order[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
  // Trigger storage event for real-time updates
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: ORDERS_KEY,
      newValue: JSON.stringify(orders),
    }),
  )
}

// Add new order
export const addSharedOrder = (order: Order) => {
  const orders = getSharedOrders()
  const newOrders = [...orders, order]
  saveSharedOrders(newOrders)
}

// Get tables from shared storage
export const getSharedTables = (): Table[] => {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem(TABLES_KEY)
  if (!stored) {
    // Initialize with default tables if not exists
    const defaultTables = [
      { id: 1, name: "Table 1", status: "available" as const, capacity: 4 },
      { id: 2, name: "Table 2", status: "occupied" as const, capacity: 2 },
      { id: 3, name: "Table 3", status: "available" as const, capacity: 6 },
      { id: 4, name: "Table 4", status: "reserved" as const, capacity: 4 },
      { id: 5, name: "Table 5", status: "available" as const, capacity: 8 },
      { id: 6, name: "Table 6", status: "cleaning" as const, capacity: 2 },
      { id: 7, name: "Table 7", status: "available" as const, capacity: 4 },
    ]
    saveSharedTables(defaultTables)
    return defaultTables
  }
  return JSON.parse(stored)
}

// Save tables to shared storage
export const saveSharedTables = (tables: Table[]) => {
  if (typeof window === "undefined") return
  localStorage.setItem(TABLES_KEY, JSON.stringify(tables))
  // Trigger storage event for real-time updates
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: TABLES_KEY,
      newValue: JSON.stringify(tables),
    }),
  )
}

// Update table status
export const updateTableStatus = (tableId: number, status: string) => {
  const tables = getSharedTables()
  const updatedTables = tables.map((table) => (table.id === tableId ? { ...table, status: status as any } : table))
  saveSharedTables(updatedTables)
}

// Get daily statistics
export const getDailyStats = (date: string) => {
  const orders = getSharedOrders()
  const dayOrders = orders.filter((order) => order.date === date)

  const totalRevenue = dayOrders.reduce((sum, order) => sum + order.total, 0)
  const totalOrders = dayOrders.length
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  // Payment method breakdown
  const cashOrders = dayOrders.filter((order) => order.paymentMethod === "Cash")
  const qrisOrders = dayOrders.filter((order) => order.paymentMethod === "QRIS")

  return {
    date,
    orders: dayOrders,
    totalRevenue,
    totalOrders,
    avgOrderValue,
    cashOrders: cashOrders.length,
    qrisOrders: qrisOrders.length,
    cashTotal: cashOrders.reduce((sum, order) => sum + order.total, 0),
    qrisTotal: qrisOrders.reduce((sum, order) => sum + order.total, 0),
  }
}

// Real-time data hook
export const useRealtimeData = () => {
  const [orders, setOrders] = useState<Order[]>(getSharedOrders())
  const [tables, setTables] = useState<Table[]>(getSharedTables())

  useEffect(() => {
    if (typeof window === "undefined") return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === ORDERS_KEY && e.newValue) {
        setOrders(JSON.parse(e.newValue))
      }
      if (e.key === TABLES_KEY && e.newValue) {
        setTables(JSON.parse(e.newValue))
      }
    }

    // Listen for storage changes
    window.addEventListener("storage", handleStorageChange)

    // Also listen for custom storage events (for same-tab updates)
    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  const refreshData = () => {
    setOrders(getSharedOrders())
    setTables(getSharedTables())
  }

  return { orders, tables, refreshData }
}

// Initialize shared data with mock data if empty
export const initializeSharedData = () => {
  if (typeof window === "undefined") return

  const existingOrders = getSharedOrders()
  if (existingOrders.length === 0) {
    const mockOrders: Order[] = [
      {
        id: 1,
        table: "Table 1",
        items: ["Burger", "Coffee"],
        subtotal: 50000,
        taxAndService: 10000,
        total: 60000,
        status: "completed",
        time: "10:30 AM",
        date: new Date().toISOString().split("T")[0],
        cashier: "John Doe",
        paymentMethod: "Cash",
      },
      {
        id: 2,
        table: "Table 2",
        items: ["Pizza", "Salad"],
        subtotal: 100000,
        taxAndService: 20000,
        total: 120000,
        status: "completed",
        time: "11:15 AM",
        date: new Date().toISOString().split("T")[0],
        cashier: "Jane Smith",
        paymentMethod: "QRIS",
      },
    ]
    saveSharedOrders(mockOrders)
  }
}
