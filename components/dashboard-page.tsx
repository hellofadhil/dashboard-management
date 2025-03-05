"use client"

import { useEffect, useState } from "react"
import { useFirebase } from "@/components/firebase-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ProductStats, CategoryData } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Package, DollarSign, ShoppingCart, AlertTriangle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export function DashboardPage() {
  const { products, loading } = useFirebase()
  const [stats, setStats] = useState<ProductStats>({
    totalProducts: 0,
    totalCategories: 0,
    totalValue: 0,
    lowStock: 0,
  })
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])

  useEffect(() => {
    if (!loading && products.length > 0) {
      // Calculate stats
      const categories = new Set(products.map((product) => product.category))
      const totalValue = products.reduce((sum, product) => sum + product.price * product.stock, 0)
      const lowStock = products.filter((product) => product.stock < 10).length

      setStats({
        totalProducts: products.length,
        totalCategories: categories.size,
        totalValue,
        lowStock,
      })

      // Generate category data
      const categoryMap = products.reduce(
        (acc, product) => {
          acc[product.category] = (acc[product.category] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      const categoryDataArray = Object.entries(categoryMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)

      setCategoryData(categoryDataArray)
    }
  }, [loading, products])

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full p-2 bg-blue-100 dark:bg-blue-900">
                <Package className="h-6 w-6 text-blue-700 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <h3 className="text-2xl font-bold">{stats.totalProducts}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full p-2 bg-green-100 dark:bg-green-900">
                <DollarSign className="h-6 w-6 text-green-700 dark:text-green-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Inventory Value</p>
                <h3 className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full p-2 bg-purple-100 dark:bg-purple-900">
                <ShoppingCart className="h-6 w-6 text-purple-700 dark:text-purple-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <h3 className="text-2xl font-bold">{stats.totalCategories}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full p-2 bg-amber-100 dark:bg-amber-900">
                <AlertTriangle className="h-6 w-6 text-amber-700 dark:text-amber-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
                <h3 className="text-2xl font-bold">{stats.lowStock}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Products Table</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        <TabsContent value="products" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Inventory</CardTitle>
            </CardHeader>
            <CardContent>
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
                    {products.slice(0, 10).map((product) => (
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
        </TabsContent>
        <TabsContent value="categories" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [value, "Products"]}
                      contentStyle={{
                        backgroundColor: "var(--background)",
                        borderColor: "var(--border)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

