"use client"

import { useEffect, useState } from "react"
import { useFirebase } from "@/components/firebase-provider"
import { useOrders } from "@/components/orders-provider"
import { useUsers } from "@/components/users-provider"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatCurrency } from "@/lib/utils"
import { Package, DollarSign, ShoppingCart, Users } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import type { DashboardStats } from "@/lib/types"

export function DashboardPage() {
  const { products, loading: productsLoading } = useFirebase()
  const { orders, loading: ordersLoading } = useOrders()
  const { users, loading: usersLoading } = useUsers()

  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalProducts: 0,
    recentOrders: [],
    topProducts: [],
    salesByDay: [],
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!productsLoading && !ordersLoading && !usersLoading) {
      // Calculate dashboard stats
      const totalOrders = orders.length
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
      const totalUsers = users.length
      const totalProducts = products.length

      // Get recent orders (last 5)
      const recentOrders = [...orders].sort((a, b) => b.createdAt - a.createdAt).slice(0, 5)

      // Calculate top products
      const productSales: Record<string, { id: string; name: string; sales: number }> = {}

      orders.forEach((order) => {
        order.items.forEach((item) => {
          if (!productSales[item.productId]) {
            productSales[item.productId] = {
              id: item.productId,
              name: item.productName,
              sales: 0,
            }
          }
          productSales[item.productId].sales += item.quantity
        })
      })

      const topProducts = Object.values(productSales)
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5)

      setStats({
        totalOrders,
        totalRevenue,
        totalUsers,
        totalProducts,
        recentOrders,
        topProducts,
        salesByDay: [],
      })

      setLoading(false)
    }
  }, [products, orders, users, productsLoading, ordersLoading, usersLoading])

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    processing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    shipped: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
    delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    refunded: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  }

  if (loading || productsLoading || ordersLoading || usersLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden border-none shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full p-2 bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Products</p>
                <h3 className="text-2xl font-bold">{stats.totalProducts}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none shadow-sm bg-gradient-to-br from-green-500/5 to-green-500/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full p-2 bg-green-500/10">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Revenue</p>
                <h3 className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none shadow-sm bg-gradient-to-br from-purple-500/5 to-purple-500/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full p-2 bg-purple-500/10">
                <ShoppingCart className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Orders</p>
                <h3 className="text-2xl font-bold">{stats.totalOrders}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none shadow-sm bg-gradient-to-br from-amber-500/5 to-amber-500/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full p-2 bg-amber-500/10">
                <Users className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Customers</p>
                <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Recent Orders</h3>
              <Button variant="ghost" size="sm" asChild className="text-xs">
                <Link href="/orders">View all</Link>
              </Button>
            </div>
            <div className="space-y-4">
              {stats.recentOrders.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No recent orders</p>
              ) : (
                <div className="space-y-4">
                  {stats.recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>{order.userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{order.userName}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{formatCurrency(order.total)}</p>
                        <Badge variant="outline" className={statusColors[order.status] || ""}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Top Products</h3>
              <Button variant="ghost" size="sm" asChild className="text-xs">
                <Link href="/products">View all</Link>
              </Button>
            </div>
            <div className="space-y-4">
              {stats.topProducts.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No product sales data</p>
              ) : (
                <div className="space-y-3">
                  {stats.topProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium">{product.name}</span>
                      </div>
                      <Badge variant="outline" className="bg-primary/10 text-primary">
                        {product.sales} sold
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Recent Products</h3>
            <Button variant="ghost" size="sm" asChild className="text-xs">
              <Link href="/products">View all</Link>
            </Button>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.slice(0, 5).map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell>{product.stock}</TableCell>
                    <TableCell>
                      {product.stock === 0 ? (
                        <Badge variant="destructive">Out of Stock</Badge>
                      ) : product.stock < 10 ? (
                        <Badge
                          variant="outline"
                          className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900"
                        >
                          Low Stock
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900"
                        >
                          In Stock
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

