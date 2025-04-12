"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function SettingsForm() {
  const [saving, setSaving] = useState(false)

  const handleSave = () => {
    setSaving(true)

    // Simulate API call
    setTimeout(() => {
      setSaving(false)
      toast({
        title: "Settings saved",
        description: "Your settings have been saved successfully",
      })
    }, 1000)
  }

  return (
    <div className="space-y-6 md:ml-64">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your application settings</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage your general application settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="app-name">Application Name</Label>
                <Input id="app-name" defaultValue="Feedback Management System" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-name">Company Name</Label>
                <Input id="company-name" defaultValue="Your Company" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="support-email">Support Email</Label>
                <Input id="support-email" type="email" defaultValue="support@example.com" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="new-feedback" className="rounded border-gray-300" defaultChecked />
                <Label htmlFor="new-feedback">Email notifications for new feedback</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="low-rating" className="rounded border-gray-300" defaultChecked />
                <Label htmlFor="low-rating">Alert for low ratings (1-2 stars)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="weekly-digest" className="rounded border-gray-300" defaultChecked />
                <Label htmlFor="weekly-digest">Weekly feedback digest</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>Manage your API keys for integrations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <div className="flex gap-2">
                  <Input id="api-key" value="••••••••••••••••••••••••••••••" readOnly />
                  <Button variant="outline">Show</Button>
                  <Button variant="outline">Regenerate</Button>
                </div>
                <p className="text-sm text-muted-foreground">Last used: Never</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input id="webhook-url" placeholder="https://your-app.com/api/webhook" />
                <p className="text-sm text-muted-foreground">
                  Receive real-time notifications when new feedback is submitted
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
