"use client"

import { useState, useEffect } from "react"
import { useFirebase } from "@/components/firebase-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ProductDialog } from "@/components/product-dialog"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/types"
import { formatCurrency, productCategories } from "@/lib/utils"
import { Plus, Edit, Trash2, Filter, Search } from "lucide-react"
import { Label } from "@/components/ui/label"

export function ProductsPage() {
  const { products, loading, deleteProduct } = useFirebase()
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [stockFilter, setStockFilter] = useState<string>("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Find max price for slider
  const maxPrice = products.length > 0 ? Math.max(...products.map((product) => product.price)) : 1000

  useEffect(() => {
    if (maxPrice > priceRange[1]) {
      setPriceRange([0, maxPrice])
    }
  }, [maxPrice, priceRange])

  useEffect(() => {
    if (!loading) {
      let filtered = [...products]

      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        filtered = filtered.filter(
          (product) => product.name.toLowerCase().includes(query) || product.description.toLowerCase().includes(query),
        )
      }

      // Apply category filter
      if (categoryFilter !== "all") {
        filtered = filtered.filter((product) => product.category === categoryFilter)
      }

      // Apply price filter
      filtered = filtered.filter((product) => product.price >= priceRange[0] && product.price <= priceRange[1])

      // Apply stock filter
      if (stockFilter === "inStock") {
        filtered = filtered.filter((product) => product.stock > 0)
      } else if (stockFilter === "lowStock") {
        filtered = filtered.filter((product) => product.stock > 0 && product.stock < 10)
      } else if (stockFilter === "outOfStock") {
        filtered = filtered.filter((product) => product.stock === 0)
      }

      setFilteredProducts(filtered)
    }
  }, [loading, products, searchQuery, categoryFilter, priceRange, stockFilter])

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(id)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Products</h1>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-64 space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
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
              <Label className="text-sm font-medium">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {productCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Price Range</Label>
              <div className="pt-6 px-2">
                <Slider value={priceRange} min={0} max={maxPrice} step={10} onValueChange={setPriceRange} />
                <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                  <span>{formatCurrency(priceRange[0])}</span>
                  <span>{formatCurrency(priceRange[1])}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Stock Status</Label>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock</SelectItem>
                  <SelectItem value="inStock">In Stock</SelectItem>
                  <SelectItem value="lowStock">Low Stock</SelectItem>
                  <SelectItem value="outOfStock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex-1">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 border rounded-lg bg-card shadow-sm">
              <p className="text-muted-foreground">No products found</p>
              <Button
                variant="link"
                onClick={() => {
                  setSearchQuery("")
                  setCategoryFilter("all")
                  setPriceRange([0, maxPrice])
                  setStockFilter("all")
                }}
              >
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="overflow-hidden group transition-all duration-300 hover:shadow-md border-none shadow-sm"
                >
                  <CardContent className="p-0">
                    <div className="relative aspect-square overflow-hidden">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
                        <div className="w-full">
                          <div className="flex justify-between items-center w-full">
                            <Badge className="bg-white/90 text-black hover:bg-white/80">{product.category}</Badge>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                className="rounded-full h-8 w-8 p-0 bg-white/90 text-black hover:bg-white/80"
                                onClick={() => handleEdit(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="rounded-full h-8 w-8 p-0 bg-white/90 text-black hover:bg-white/80"
                                onClick={() => handleDelete(product.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      {product.stock === 0 && (
                        <div className="absolute top-2 right-2">
                          <Badge variant="destructive" className="font-semibold">
                            OUT OF STOCK
                          </Badge>
                        </div>
                      )}
                      {product.stock > 0 && product.stock < 10 && (
                        <div className="absolute top-2 right-2">
                          <Badge
                            variant="outline"
                            className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900 font-semibold"
                          >
                            LOW STOCK: {product.stock}
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <div className="flex flex-col gap-2">
                        <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold">{formatCurrency(product.price)}</span>
                          </div>
                          <span
                            className={`text-sm ${
                              product.stock === 0
                                ? "text-destructive"
                                : product.stock < 10
                                  ? "text-amber-500 dark:text-amber-400"
                                  : "text-green-500 dark:text-green-400"
                            }`}
                          >
                            {product.stock === 0
                              ? "Out of stock"
                              : product.stock < 10
                                ? `${product.stock} left`
                                : `In stock: ${product.stock}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <ProductDialog open={showAddDialog} onOpenChange={setShowAddDialog} mode="add" />

      {editingProduct && (
        <ProductDialog
          open={!!editingProduct}
          onOpenChange={(open) => {
            if (!open) setEditingProduct(null)
          }}
          mode="edit"
          product={editingProduct}
        />
      )}
    </div>
  )
}

