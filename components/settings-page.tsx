"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useTheme } from "next-themes"

export function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [lowStockAlerts, setLowStockAlerts] = useState(true)

  const [storeInfo, setStoreInfo] = useState({
    name: "My Ecommerce Store",
    email: "contact@mystore.com",
    phone: "+1 (555) 123-4567",
    address: "123 Commerce St, Business City, 12345",
    description: "We sell high-quality products at competitive prices.",
  })

  const handleStoreInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setStoreInfo((prev) => ({ ...prev, [name]: value }))
  }

  const handleSaveStoreInfo = () => {
    // Save store info to database
    alert("Store information saved successfully!")
  }

  const handleSaveNotifications = () => {
    // Save notification settings
    alert("Notification settings saved successfully!")
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>Update your store details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Store Name</Label>
                <Input id="name" name="name" value={storeInfo.name} onChange={handleStoreInfoChange} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" value={storeInfo.email} onChange={handleStoreInfoChange} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" value={storeInfo.phone} onChange={handleStoreInfoChange} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" value={storeInfo.address} onChange={handleStoreInfoChange} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Store Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={storeInfo.description}
                  onChange={handleStoreInfoChange}
                  rows={4}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveStoreInfo}>Save Changes</Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Firebase Configuration</CardTitle>
              <CardDescription>Your Firebase database connection settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input id="apiKey" value="AIzaSyAUUsNaN..." readOnly />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="databaseURL">Database URL</Label>
                  <Input
                    id="databaseURL"
                    value="https://dashboard-manajement-default-rtdb.asia-southeast1.firebasedatabase.app"
                    readOnly
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="projectId">Project ID</Label>
                  <Input id="projectId" value="dashboard-manajement" readOnly />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline">Update Firebase Config</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how you want to receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications about important events</p>
                </div>
                <Switch id="notifications" checked={notificationsEnabled} onCheckedChange={setNotificationsEnabled} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                  disabled={!notificationsEnabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="low-stock">Low Stock Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified when product stock is low</p>
                </div>
                <Switch
                  id="low-stock"
                  checked={lowStockAlerts}
                  onCheckedChange={setLowStockAlerts}
                  disabled={!notificationsEnabled}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveNotifications}>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Theme Settings</CardTitle>
              <CardDescription>Customize the appearance of your dashboard</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div
                  className={`border rounded-lg p-4 cursor-pointer ${theme === "light" ? "ring-2 ring-primary" : ""}`}
                  onClick={() => setTheme("light")}
                >
                  <div className="h-20 bg-white border rounded-md mb-2"></div>
                  <p className="text-center font-medium">Light</p>
                </div>

                <div
                  className={`border rounded-lg p-4 cursor-pointer ${theme === "dark" ? "ring-2 ring-primary" : ""}`}
                  onClick={() => setTheme("dark")}
                >
                  <div className="h-20 bg-slate-950 border rounded-md mb-2"></div>
                  <p className="text-center font-medium">Dark</p>
                </div>

                <div
                  className={`border rounded-lg p-4 cursor-pointer ${theme === "system" ? "ring-2 ring-primary" : ""}`}
                  onClick={() => setTheme("system")}
                >
                  <div className="h-20 bg-gradient-to-r from-white to-slate-950 border rounded-md mb-2"></div>
                  <p className="text-center font-medium">System</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

