import { ShoppingBag } from "lucide-react"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showText?: boolean
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div className="absolute inset-0 bg-primary rounded-full blur-sm opacity-20"></div>
        <div className="relative bg-gradient-to-br from-primary to-primary/70 text-primary-foreground p-1.5 rounded-full">
          <ShoppingBag className={sizeClasses[size]} strokeWidth={2} />
        </div>
      </div>
      {showText && (
        <span className={`font-bold ${size === "lg" ? "text-xl" : size === "md" ? "text-lg" : "text-base"}`}>
          Dashboard
        </span>
      )}
    </div>
  )
}

