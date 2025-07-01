import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"
import { Mona_Sans as FontSans } from "next/font/google"
import { MainNav } from "@/components/main-nav"
import { UserNav } from "@/components/user-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { SalesProvider } from "@/context/sales-context"
import { ProductsProvider } from "@/context/products-context"
import { SettingsProvider } from "@/context/settings-context"
import { Toaster } from "@/components/ui/toaster"
import { PurchasesProvider } from "@/context/purchases-context"
import { SalespersonsProvider } from "@/context/salespersons-context"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "CBD製品販売管理システム",
  description: "CBD製品の売上を記録・可視化し、販売状況の判断や施策立案をサポートします。",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SalespersonsProvider>
            <SalesProvider>
              <ProductsProvider>
                <SettingsProvider>
                  <PurchasesProvider>
                    <div className="flex min-h-screen flex-col">
                      <div className="border-b">
                        <div className="flex h-16 items-center px-4">
                          <MainNav />
                          <div className="ml-auto flex items-center space-x-4">
                            <ModeToggle />
                            <UserNav />
                          </div>
                        </div>
                      </div>
                      {children}
                    </div>
                    <Toaster />
                  </PurchasesProvider>
                </SettingsProvider>
              </ProductsProvider>
            </SalesProvider>
          </SalespersonsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
