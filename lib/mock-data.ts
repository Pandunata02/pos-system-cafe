// Updated mock data with Rupiah prices
export const mockTables = [
  { id: 1, name: "Table 1", status: "available", capacity: 4 },
  { id: 2, name: "Table 2", status: "occupied", capacity: 2 },
  { id: 3, name: "Table 3", status: "available", capacity: 6 },
  { id: 4, name: "Table 4", status: "reserved", capacity: 4 },
  { id: 5, name: "Table 5", status: "available", capacity: 8 },
  { id: 6, name: "Table 6", status: "cleaning", capacity: 2 },
  { id: 7, name: "Table 7", status: "available", capacity: 4 },
]

export const mockMenu = [
  { id: 1, name: "Burger", price: 45000, category: "Main", stock: 25 },
  { id: 2, name: "Pizza", price: 85000, category: "Main", stock: 15 },
  { id: 3, name: "Salad", price: 35000, category: "Appetizer", stock: 30 },
  { id: 4, name: "Coffee", price: 15000, category: "Beverage", stock: 50 },
  { id: 5, name: "Cake", price: 25000, category: "Dessert", stock: 12 },
  { id: 6, name: "Sandwich", price: 40000, category: "Main", stock: 20 },
  { id: 7, name: "Juice", price: 20000, category: "Beverage", stock: 35 },
]

export const mockOrders = [
  {
    id: 1,
    table: "Table 1",
    items: ["Burger", "Coffee"],
    total: 60000,
    status: "completed",
    time: "10:30 AM",
    date: "2024-01-15",
    cashier: "John Doe",
  },
  {
    id: 2,
    table: "Table 2",
    items: ["Pizza", "Salad"],
    total: 120000,
    status: "completed",
    time: "11:15 AM",
    date: "2024-01-15",
    cashier: "Jane Smith",
  },
  {
    id: 3,
    table: "Table 3",
    items: ["Burger", "Cake"],
    total: 70000,
    status: "completed",
    time: "12:00 PM",
    date: "2024-01-14",
    cashier: "John Doe",
  },
  {
    id: 4,
    table: "Table 5",
    items: ["Coffee", "Salad", "Sandwich"],
    total: 90000,
    status: "completed",
    time: "2:30 PM",
    date: "2024-01-14",
    cashier: "Jane Smith",
  },
  {
    id: 5,
    table: "Table 7",
    items: ["Pizza", "Juice"],
    total: 105000,
    status: "completed",
    time: "3:45 PM",
    date: "2024-01-15",
    cashier: "John Doe",
  },
]

export const mockStock = [
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
  { id: 6, name: "Sandwich", category: "Main", currentStock: 20, minStock: 8, maxStock: 35, price: 40000, cost: 25000 },
  {
    id: 7,
    name: "Juice",
    category: "Beverage",
    currentStock: 35,
    minStock: 15,
    maxStock: 60,
    price: 20000,
    cost: 12000,
  },
]

// Login history tracking functions remain the same
export const getLoginHistory = () => {
  if (typeof window === "undefined") return []
  return JSON.parse(localStorage.getItem("loginHistory") || "[]")
}

export const addLoginRecord = (username: string, role: string) => {
  if (typeof window === "undefined") return

  const loginHistory = getLoginHistory()
  const loginRecord = {
    id: Date.now(),
    username,
    role,
    loginTime: new Date().toISOString(),
    logoutTime: null,
  }

  loginHistory.push(loginRecord)
  localStorage.setItem("loginHistory", JSON.stringify(loginHistory))
}
