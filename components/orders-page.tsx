"use client"

import { useState } from "react"
import { useOrders } from "@/components/orders-provider"
import { useUsers } from "@/components/users-provider"
import { useFirebase } from "@/components/firebase-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Search, MoreHorizontal, Trash2, ShoppingBag, Filter, Eye, Truck, AlertCircle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import type { Order, OrderStatus } from "@/lib/types"

export function OrdersPage() {
  const { orders, loading, updateOrder, deleteOrder } = useOrders()
  const { users } = useUsers()
  const { products } = useFirebase()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Filter orders based on search query and filters
  const filteredOrders = orders.filter((order) => {
    // Apply search filter
    if (
      searchQuery &&
      !order.id.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !order.userName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !order.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    // Apply status filter
    if (statusFilter !== "all" && order.status !== statusFilter) {
      return false
    }

    return true
  })

  const handleView = (order: Order) => {
    setViewingOrder(order)
    setShowViewDialog(true)
  }

  const handleEdit = (order: Order) => {
    setEditingOrder(order)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      await deleteOrder(id)
    }
  }

  const handleUpdateStatus = async (id: string, status: OrderStatus) => {
    await updateOrder(id, { status })
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    processing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    shipped: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
    delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    refunded: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  }

  const paymentStatusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Order Management</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-64 space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8"
            />
          </div>

          <div className="md:hidden">
            <Button variant="outline" className="w-full justify-between" onClick={() => setShowFilters(!showFilters)}>
              <span className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </span>
            </Button>
          </div>

          <div className={`space-y-4 ${showFilters ? "block" : "hidden md:block"}`}>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Order Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id.slice(0, 8)}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.userName}</div>
                            <div className="text-xs text-muted-foreground">{order.userEmail}</div>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(order.total)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusColors[order.status] || ""}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={paymentStatusColors[order.paymentStatus] || ""}>
                            {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleView(order)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(order.id, "pending")}
                                disabled={order.status === "pending"}
                              >
                                <AlertCircle className="mr-2 h-4 w-4 text-yellow-500" />
                                Mark as Pending
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(order.id, "processing")}
                                disabled={order.status === "processing"}
                              >
                                <ShoppingBag className="mr-2 h-4 w-4 text-blue-500" />
                                Mark as Processing
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(order.id, "shipped")}
                                disabled={order.status === "shipped"}
                              >
                                <Truck className="mr-2 h-4 w-4 text-indigo-500" />
                                Mark as Shipped
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(order.id, "delivered")}
                                disabled={order.status === "delivered"}
                              >
                                <Truck className="mr-2 h-4 w-4 text-green-500" />
                                Mark as Delivered
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleUpdateStatus(order.id, "cancelled")}
                                disabled={order.status === "cancelled"}
                              >
                                <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
                                Mark as Cancelled
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(order.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {viewingOrder && (
        <OrderDetailsDialog open={showViewDialog} onOpenChange={setShowViewDialog} order={viewingOrder} />
      )}
    </div>
  )
}

interface OrderDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order
}

function OrderDetailsDialog({ open, onOpenChange, order }: OrderDetailsDialogProps) {
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    processing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    shipped: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
    delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    refunded: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  }

  const paymentStatusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            Order #{order.id.slice(0, 8)} - {new Date(order.createdAt).toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Customer Information</h3>
              <div className="space-y-1">
                <p className="font-medium">{order.userName}</p>
                <p className="text-sm">{order.userEmail}</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Shipping Address</h3>
              <p className="text-sm whitespace-pre-line">{order.shippingAddress}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Order Status</h3>
              <Badge variant="outline" className={statusColors[order.status] || ""}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Badge>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Payment Method</h3>
              <p>{order.paymentMethod}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Payment Status</h3>
              <Badge variant="outline" className={paymentStatusColors[order.paymentStatus] || ""}>
                {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
              </Badge>
            </div>
          </div>

          {order.trackingNumber && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Tracking Number</h3>
              <p>{order.trackingNumber}</p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Order Items</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.subtotal)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-medium">
                    Total
                  </TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(order.total)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {order.notes && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Notes</h3>
              <p className="text-sm whitespace-pre-line">{order.notes}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

