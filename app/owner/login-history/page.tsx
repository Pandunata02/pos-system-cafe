"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { FileDown, Clock, User } from "lucide-react"
import { exportToExcel } from "@/lib/excel-export"

export default function LoginHistoryPage() {
  const [loginHistory, setLoginHistory] = useState([])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const history = JSON.parse(localStorage.getItem("loginHistory") || "[]")
      setLoginHistory(history)
    }
  }, [])

  const formatDateTime = (isoString) => {
    if (!isoString) return "Still logged in"
    const date = new Date(isoString)
    return date.toLocaleString()
  }

  const calculateSessionDuration = (loginTime, logoutTime) => {
    if (!logoutTime) return "Active"
    const login = new Date(loginTime)
    const logout = new Date(logoutTime)
    const duration = logout.getTime() - login.getTime()
    const hours = Math.floor(duration / (1000 * 60 * 60))
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const exportLoginHistory = () => {
    const exportData = loginHistory.map((session) => ({
      Username: session.username,
      Role: session.role,
      "Login Time": formatDateTime(session.loginTime),
      "Logout Time": session.logoutTime ? formatDateTime(session.logoutTime) : "Still logged in",
      "Session Duration": calculateSessionDuration(session.loginTime, session.logoutTime),
      Date: new Date(session.loginTime).toLocaleDateString(),
    }))

    exportToExcel(exportData, `login-history-${new Date().toISOString().split("T")[0]}`, "Login History")
  }

  return (
    <SidebarProvider>
      <AppSidebar userRole="owner" />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-semibold">Login History</h1>
              <p className="text-sm text-muted-foreground">Track user login and logout times</p>
            </div>
          </div>
        </header>

        <div className="p-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>User Login History</CardTitle>
                <CardDescription>Complete log of user sessions with timestamps</CardDescription>
              </div>
              <Button onClick={exportLoginHistory}>
                <FileDown className="h-4 w-4 mr-2" />
                Export History
              </Button>
            </CardHeader>
            <CardContent>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Sessions</p>
                        <p className="text-2xl font-bold">{loginHistory.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Active Sessions</p>
                        <p className="text-2xl font-bold">
                          {loginHistory.filter((session) => !session.logoutTime).length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <User className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Unique Users</p>
                        <p className="text-2xl font-bold">
                          {new Set(loginHistory.map((session) => session.username)).size}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Username</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Login Time</TableHead>
                    <TableHead>Logout Time</TableHead>
                    <TableHead>Session Duration</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loginHistory.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">{session.username}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {session.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDateTime(session.loginTime)}</TableCell>
                      <TableCell>{formatDateTime(session.logoutTime)}</TableCell>
                      <TableCell>{calculateSessionDuration(session.loginTime, session.logoutTime)}</TableCell>
                      <TableCell>
                        <Badge variant={session.logoutTime ? "secondary" : "default"}>
                          {session.logoutTime ? "Completed" : "Active"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
