"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Sidebar } from "@/components/sidebar"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // close sidebar when route changes (mobile)
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <AuthGuard>
      <div className="h-screen bg-gray-50 flex flex-col">
        {/* Top bar for mobile with menu button */}
        <header className="md:hidden bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="h-14 flex items-center">
              <Button variant="ghost" onClick={() => setIsOpen(true)} className="p-2">
                <Menu className="w-5 h-5" />
              </Button>
              <div className="ml-3 font-semibold">Admin</div>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <Sidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />

          {/* Main content should not be pushed on mobile; it's full width and sits under overlay */}
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
