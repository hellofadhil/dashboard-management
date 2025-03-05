import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export const productCategories = [
  "Electronics",
  "Clothing",
  "Home & Kitchen",
  "Beauty & Personal Care",
  "Books",
  "Toys & Games",
  "Sports & Outdoors",
  "Health & Wellness",
  "Automotive",
  "Jewelry",
  "Furniture",
  "Office Supplies",
  "Pet Supplies",
  "Food & Beverages",
  "Art & Crafts",
  "Baby Products",
  "Garden & Outdoor",
  "Tools & Home Improvement",
  "Musical Instruments",
  "Travel & Luggage",
]

export const generateRandomId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

