"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, CheckCircle, Clock, AlertCircle } from "lucide-react"

interface Table {
  id: number
  name: string
  status: "available" | "occupied" | "reserved" | "cleaning"
  capacity: number
  currentOrder?: number
}

interface TableStatusManagerProps {
  tables: Table[]
  onTableStatusChange: (tableId: number, newStatus: string) => void
}

export function TableStatusManager({ tables, onTableStatusChange }: TableStatusManagerProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "occupied":
        return <Users className="h-4 w-4 text-red-600" />
      case "reserved":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "cleaning":
        return <AlertCircle className="h-4 w-4 text-blue-600" />
      default:
        return <CheckCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "border-green-200 bg-green-50"
      case "occupied":
        return "border-red-200 bg-red-50"
      case "reserved":
        return "border-yellow-200 bg-yellow-50"
      case "cleaning":
        return "border-blue-200 bg-blue-50"
      default:
        return "border-gray-200 bg-gray-50"
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "available":
        return "default"
      case "occupied":
        return "destructive"
      case "reserved":
        return "secondary"
      case "cleaning":
        return "outline"
      default:
        return "secondary"
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {tables.map((table) => (
        <Card key={table.id} className={`border-2 ${getStatusColor(table.status)}`}>
          <CardContent className="p-4">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                {getStatusIcon(table.status)}
                <h3 className="font-semibold">{table.name}</h3>
              </div>

              <p className="text-sm text-muted-foreground">Capacity: {table.capacity}</p>

              <Badge variant={getStatusVariant(table.status)} className="capitalize">
                {table.status}
              </Badge>

              {table.currentOrder && <p className="text-xs text-muted-foreground">Order #{table.currentOrder}</p>}

              <div className="space-y-2">
                <Select value={table.status} onValueChange={(newStatus) => onTableStatusChange(table.id, newStatus)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
