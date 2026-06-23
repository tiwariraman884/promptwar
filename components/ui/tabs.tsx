"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

/* ─── Root ─── */
const Tabs = TabsPrimitive.Root;

/* ─── List ─── */
const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className = "", ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={`inline-flex items-center gap-1 rounded-2xl bg-white/60 dark:bg-white/[0.04] border border-[#52B788]/15 dark:border-white/10 p-1.5 backdrop-blur-sm ${className}`}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

/* ─── Trigger ─── */
const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className = "", ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#52B788] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-[#1B4332]/60 dark:text-white/50 hover:text-[#1B4332] dark:hover:text-white data-[state=active]:bg-[#2D6A4F] data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-[#2D6A4F]/20 ${className}`}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

/* ─── Content ─── */
const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className = "", ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={`mt-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#52B788] focus-visible:ring-offset-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ${className}`}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
