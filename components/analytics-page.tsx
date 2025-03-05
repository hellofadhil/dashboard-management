"use client"

import { useEffect, useState } from "react"
import { useFirebase } from "@/components/firebase-provider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export function AnalyticsPage() {
  const { products, loading } = useFirebase()
  const [salesData, setSalesData] = useState<any[]>([])
  const [categoryData, setCategoryData] = useState<any[]>([])
  const [stockData, setStockData] = useState<any[]>([])

  useEffect(() => {
    if (!loading && products.length > 0) {
      // Generate mock sales data
      const last12Months = Array.from({ length: 12 }, (_, i) => {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        return {
          name: date.toLocaleString("default", { month: "short" }),
          sales: Math.floor(Math.random() * 50000) + 10000,
          profit: Math.floor(Math.random() * 20000) + 5000,
        }
      }).reverse()

      setSalesData(last12Months)

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

      setCategoryData(categoryDataArray)

      // Generate stock data
      const stockStatusData = [
        { name: "In Stock", value: products.filter((p) => p.stock > 10).length },
        { name: "Low Stock", value: products.filter((p) => p.stock > 0 && p.stock <= 10).length },
        { name: "Out of Stock", value: products.filter((p) => p.stock === 0).length },
      ]

      setStockData(stockStatusData)
    }
  }, [loading, products])

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"]
  const STOCK_COLORS = ["#4ade80", "#facc15", "#f87171"]

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>

      <Card>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value) => [formatCurrency(value as number), ""]}
                  contentStyle={{
                    backgroundColor: "var(--background)",
                    borderColor: "var(--border)",
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="sales"
                  stroke="#8884d8"
                  name="Sales"
                  activeDot={{ r: 8 }}
                />
                <Line yAxisId="right" type="monotone" dataKey="profit" stroke="#82ca9d" name="Profit" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Products by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
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

        <Card>
          <CardHeader>
            <CardTitle>Inventory Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stockData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--background)",
                      borderColor: "var(--border)",
                    }}
                  />
                  <Bar dataKey="value" name="Products">
                    {stockData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STOCK_COLORS[index % STOCK_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

