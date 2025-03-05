"use client"

import type React from "react"

import { useState } from "react"
import { useFirebase } from "@/components/firebase-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Product, ProductFormData } from "@/lib/types"
import { productCategories } from "@/lib/utils"

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit"
  product?: Product
}

export function ProductDialog({ open, onOpenChange, mode, product }: ProductDialogProps) {
  const { addProduct, updateProduct } = useFirebase()
  const [loading, setLoading] = useState(false)

  const defaultFormData: ProductFormData = {
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || 0,
    category: product?.category || productCategories[0],
    stock: product?.stock || 0,
    image: product?.image || "https://source.unsplash.com/random/300x300/?product",
  }

  const [formData, setFormData] = useState<ProductFormData>(defaultFormData)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "stock" ? Number(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === "add") {
        await addProduct(formData)
      } else if (mode === "edit" && product) {
        await updateProduct(product.id, formData)
      }

      onOpenChange(false)
      setFormData(defaultFormData)
    } catch (error) {
      console.error("Error saving product:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-4">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{mode === "add" ? "Add New Product" : "Edit Product"}</DialogTitle>
            <DialogDescription>
              {mode === "add" ? "Add a new product to your inventory" : "Make changes to the product details"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Product Name
              </label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="price" className="text-sm font-medium">
                  Price
                </label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="stock" className="text-sm font-medium">
                  Stock
                </label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label htmlFor="category" className="text-sm font-medium">
                Category
              </label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {productCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <label htmlFor="image" className="text-sm font-medium">
                Image URL
              </label>
              <Input
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
              {formData.image && (
                <div className="mt-2 aspect-square w-20 rounded overflow-hidden">
                  <img
                    src={formData.image || "/placeholder.svg"}
                    alt="Product preview"
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg"
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : mode === "add" ? "Add Product" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

