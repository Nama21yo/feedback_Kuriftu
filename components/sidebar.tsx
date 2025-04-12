"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { BarChart3, MessageSquare, Settings, Home, X } from "lucide-react"

interface SidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const pathname = usePathname()

  const routes = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      name: "Feedbacks",
      href: "/dashboard/feedbacks",
      icon: MessageSquare,
    },
    {
      name: "Analytics",
      href: "/dashboard/analytics",
      icon: BarChart3,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ]

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="p-0 w-64">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Feedback Admin</h2>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4">
                <nav className="space-y-1">
                  {routes.map((route) => (
                    <Link key={route.href} href={route.href} onClick={() => onOpenChange(false)}>
                      <span
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                          pathname === route.href ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                        )}
                      >
                        <route.icon className="h-5 w-5" />
                        {route.name}
                      </span>
                    </Link>
                  ))}
                </nav>
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-1 border-r bg-card">
          <div className="flex items-center h-16 px-4 border-b">
            <h2 className="text-lg font-semibold">Feedback Admin</h2>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4">
              <nav className="space-y-1">
                {routes.map((route) => (
                  <Link key={route.href} href={route.href}>
                    <span
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                        pathname === route.href ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                      )}
                    >
                      <route.icon className="h-5 w-5" />
                      {route.name}
                    </span>
                  </Link>
                ))}
              </nav>
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  )
}
