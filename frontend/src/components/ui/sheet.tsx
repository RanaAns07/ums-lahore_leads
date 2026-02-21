import * as React from "react"
import { cn } from "@/lib/utils"

const Sheet = ({ children, open, onOpenChange }: { children: React.ReactNode, open?: boolean, onOpenChange?: (open: boolean) => void }) => <div>{children}</div>
const SheetTrigger = ({ children }: { children: React.ReactNode }) => <div>{children}</div>
const SheetContent = ({ children, className }: { children: React.ReactNode, className?: string }) => <div className={cn("bg-white", className)}>{children}</div>
const SheetHeader = ({ children, className }: { children: React.ReactNode, className?: string }) => <div className={cn("flex flex-col space-y-2", className)}>{children}</div>
const SheetTitle = ({ children, className }: { children: React.ReactNode, className?: string }) => <div className={cn("text-lg font-semibold", className)}>{children}</div>
const SheetDescription = ({ children, className }: { children: React.ReactNode, className?: string }) => <div className={cn("text-sm text-muted-foreground", className)}>{children}</div>

export { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription }
