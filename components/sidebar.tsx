"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  MessageSquare,
  Settings,
  Home,
  X,
  HelpCircle,
  Users,
  Star,
  Sparkles,
  Languages,
} from "lucide-react";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

interface SidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const statsRef = doc(db, "analytics", "feedbackStats");
        const statsSnap = await getDoc(statsRef);

        if (statsSnap.exists()) {
          setPendingCount(statsSnap.data()?.pendingCount || 0);
        }
      } catch (error) {
        console.error("Error fetching pending count:", error);
      }
    };

    fetchPendingCount();

    const interval = setInterval(fetchPendingCount, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const mainRoutes = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      name: "Feedbacks",
      href: "/dashboard/feedbacks",
      icon: MessageSquare,
      badge: pendingCount > 0 ? pendingCount : undefined,
      badgeVariant: "destructive" as const,
    },
    {
      name: "Analytics",
      href: "/dashboard/analytics",
      icon: BarChart3,
    },
  ];

  const feedbackRoutes = [
    {
      name: "All Feedbacks",
      href: "/dashboard/feedbacks",
      icon: MessageSquare,
    },
    {
      name: "Smart Summary",
      href: "/dashboard/feedbacks/summary",
      icon: Sparkles,
    },
  ];

  const systemRoutes = [
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
    {
      name: "Languages",
      href: "/dashboard/settings/languages",
      icon: Languages,
    },
    {
      name: "Help",
      href: "/dashboard/help",
      icon: HelpCircle,
    },
  ];

  const renderNavItems = (routes: typeof mainRoutes) => {
    return routes.map((route) => (
      <Link
        key={route.href}
        href={route.href}
        onClick={() => onOpenChange(false)}
      >
        <span
          className={cn(
            "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium",
            pathname === route.href
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          )}
        >
          <span className="flex items-center gap-3">
            <route.icon className="h-5 w-5" />
            {route.name}
          </span>
          {route.badge && (
            <Badge variant={route.badgeVariant} className="ml-auto">
              {route.badge}
            </Badge>
          )}
        </span>
      </Link>
    ));
  };

  const SidebarContent = () => (
    <div className="flex flex-col flex-1">
      <div className="flex items-center justify-between h-16 px-4 border-b">
        <div className="flex items-center gap-2">
          <Star className="h-6 w-6 text-primary" />
          <h2 className="text-lg font-semibold">Kuriftu Resort</h2>
        </div>
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Main Navigation */}
          <nav className="space-y-1">{renderNavItems(mainRoutes)}</nav>

          {/* Feedback Management */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Feedback Management
            </h3>
            <Separator className="mb-2" />
            <nav className="space-y-1">{renderNavItems(feedbackRoutes)}</nav>
          </div>

          {/* System */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              System
            </h3>
            <Separator className="mb-2" />
            <nav className="space-y-1">{renderNavItems(systemRoutes)}</nav>
          </div>
        </div>
      </ScrollArea>

      {/* User section at bottom */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-muted-foreground">Kuriftu Management</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="p-0 w-72 sm:max-w-sm">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-1 border-r bg-card">
          <SidebarContent />
        </div>
      </div>
    </>
  );
}
