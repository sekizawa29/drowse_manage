"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Overview } from "@/components/dashboard/overview"
import { RecentSales } from "@/components/dashboard/recent-sales"
import { SalesByProduct } from "@/components/dashboard/sales-by-product"
import { SalesComparison } from "@/components/dashboard/sales-comparison"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { useSales } from "@/context/sales-context"
import { useSettings } from "@/context/settings-context"
import { isThisWeek, startOfDay, endOfDay, isSameMonth, isSameYear, format } from "date-fns"
import { ja } from "date-fns/locale"
import { usePurchases } from "@/context/purchases-context"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

// ── Compact profit row ──
function ProfitRow({ totalSales, totalPurchases, profit, profitRate }: {
  totalSales: number
  totalPurchases: number
  profit: number
  profitRate: number
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="bg-muted/30 rounded-lg p-3">
        <p className="text-[11px] text-muted-foreground mb-1">売上</p>
        <p className="text-sm md:text-lg font-bold tabular-nums">¥{totalSales.toLocaleString()}</p>
      </div>
      <div className="bg-muted/30 rounded-lg p-3">
        <p className="text-[11px] text-muted-foreground mb-1">仕入れ</p>
        <p className="text-sm md:text-lg font-bold tabular-nums">¥{totalPurchases.toLocaleString()}</p>
      </div>
      <div className={`rounded-lg p-3 ${profit >= 0 ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
        <p className="text-[11px] text-muted-foreground mb-1">利益</p>
        <p className="text-sm md:text-lg font-bold tabular-nums">¥{profit.toLocaleString()}</p>
        <p className="text-[10px] text-muted-foreground">{profitRate.toFixed(1)}%</p>
      </div>
    </div>
  )
}

// ── KPI mini card ──
function KpiCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border bg-card p-3 md:p-4">
      <p className="text-[11px] md:text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-lg md:text-2xl font-bold tabular-nums leading-tight">{value}</p>
      <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">{sub}</p>
    </div>
  )
}

export default function DashboardPageClient() {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())
  const [activeTab, setActiveTab] = useState("overview")
  const { sales, isLoading: salesLoading } = useSales()
  const { salesTargets } = useSettings()
  const { purchases, isLoading: purchasesLoading } = usePurchases()

  const isLoading = salesLoading || purchasesLoading

  // ── Sales data calculation (memoized per period) ──
  const calculateSalesData = (period: "daily" | "weekly" | "monthly" | "yearly") => {
    const now = new Date()
    let filteredSales: typeof sales = []
    let periodLabel = ""
    let comparisonLabel = ""
    let targetAmount = 0

    switch (period) {
      case "daily":
        if (isSameMonth(selectedMonth, now) && isSameYear(selectedMonth, now)) {
          filteredSales = sales.filter((s) => s.date >= startOfDay(now) && s.date <= endOfDay(now))
        } else {
          const last = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0)
          filteredSales = sales.filter(
            (s) => s.date.getFullYear() === last.getFullYear() && s.date.getMonth() === last.getMonth() && s.date.getDate() === last.getDate(),
          )
        }
        periodLabel = "日次売上"
        comparisonLabel = "前日比"
        targetAmount = salesTargets.daily
        break
      case "weekly":
        filteredSales = sales.filter(
          (s) => s.date.getFullYear() === selectedMonth.getFullYear() && s.date.getMonth() === selectedMonth.getMonth() && isThisWeek(s.date, { locale: ja }),
        )
        periodLabel = "週次売上"
        comparisonLabel = "前週比"
        targetAmount = salesTargets.weekly
        break
      case "monthly":
        filteredSales = sales.filter(
          (s) => s.date.getFullYear() === selectedMonth.getFullYear() && s.date.getMonth() === selectedMonth.getMonth(),
        )
        periodLabel = "月次売上"
        comparisonLabel = "前月比"
        targetAmount = salesTargets.monthly
        break
      case "yearly":
        filteredSales = sales.filter((s) => s.date.getFullYear() === selectedMonth.getFullYear())
        periodLabel = "年次売上"
        comparisonLabel = "前年比"
        targetAmount = salesTargets.yearly
        break
    }

    const totalAmount = filteredSales.reduce((sum, s) => sum + s.amount, 0)
    const achievementRate = targetAmount > 0 ? (totalAmount / targetAmount) * 100 : 0
    const comparisonRate = Math.random() * 10 - 2

    return { totalAmount, periodLabel, comparisonLabel, comparisonRate, achievementRate, targetAmount, filteredSales }
  }

  // Memoize overview KPIs to avoid recalculating 4× per render
  const dailyData = useMemo(() => calculateSalesData("daily"), [sales, selectedMonth, salesTargets])
  const weeklyData = useMemo(() => calculateSalesData("weekly"), [sales, selectedMonth, salesTargets])
  const monthlyData = useMemo(() => calculateSalesData("monthly"), [sales, selectedMonth, salesTargets])

  // Active-tab specific data
  const activeData = useMemo(
    () => calculateSalesData(activeTab === "overview" ? "monthly" : (activeTab as any)),
    [sales, selectedMonth, salesTargets, activeTab],
  )

  // ── Profit calculation ──
  const calculateProfit = (period: "daily" | "weekly" | "monthly" | "yearly") => {
    const now = new Date()
    let fSales: typeof sales = []
    let fPurchases: typeof purchases = []

    switch (period) {
      case "daily":
        if (isSameMonth(selectedMonth, now) && isSameYear(selectedMonth, now)) {
          fSales = sales.filter((s) => s.date >= startOfDay(now) && s.date <= endOfDay(now))
          fPurchases = purchases.filter((p) => p.date >= startOfDay(now) && p.date <= endOfDay(now))
        } else {
          const last = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0)
          fSales = sales.filter((s) => s.date.getFullYear() === last.getFullYear() && s.date.getMonth() === last.getMonth() && s.date.getDate() === last.getDate())
          fPurchases = purchases.filter((p) => p.date.getFullYear() === last.getFullYear() && p.date.getMonth() === last.getMonth() && p.date.getDate() === last.getDate())
        }
        break
      case "weekly":
        fSales = sales.filter((s) => s.date.getFullYear() === selectedMonth.getFullYear() && s.date.getMonth() === selectedMonth.getMonth() && isThisWeek(s.date, { locale: ja }))
        fPurchases = purchases.filter((p) => p.date.getFullYear() === selectedMonth.getFullYear() && p.date.getMonth() === selectedMonth.getMonth() && isThisWeek(p.date, { locale: ja }))
        break
      case "monthly":
        fSales = sales.filter((s) => s.date.getFullYear() === selectedMonth.getFullYear() && s.date.getMonth() === selectedMonth.getMonth())
        fPurchases = purchases.filter((p) => p.date.getFullYear() === selectedMonth.getFullYear() && p.date.getMonth() === selectedMonth.getMonth())
        break
      case "yearly":
        fSales = sales.filter((s) => s.date.getFullYear() === selectedMonth.getFullYear())
        fPurchases = purchases.filter((p) => p.date.getFullYear() === selectedMonth.getFullYear())
        break
    }

    const totalSales = fSales.reduce((sum, s) => sum + s.amount, 0)
    const totalPurchases = fPurchases.reduce((sum, p) => sum + p.amount, 0)
    const profit = totalSales - totalPurchases
    const profitRate = totalSales > 0 ? (profit / totalSales) * 100 : 0
    return { totalSales, totalPurchases, profit, profitRate }
  }

  const profitData = useMemo(
    () => calculateProfit(activeTab === "overview" ? "monthly" : (activeTab as any)),
    [sales, purchases, selectedMonth, activeTab],
  )

  const fmtRate = (r: number) => `${r > 0 ? "+" : ""}${r.toFixed(1)}%`

  if (isLoading) {
    return (
      <div className="flex-1 p-4 md:p-8 pt-6">
        <LoadingSpinner text="データを読み込み中..." />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-3 md:space-y-4 p-3 md:p-8 pt-3 md:pt-6">
      <DashboardHeader selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} />

      <Tabs defaultValue="overview" className="space-y-3 md:space-y-4" onValueChange={setActiveTab}>
        <TabsList className="w-full h-auto p-1">
          <TabsTrigger value="overview" className="flex-1 text-xs md:text-sm py-1.5">概要</TabsTrigger>
          <TabsTrigger value="daily" className="flex-1 text-xs md:text-sm py-1.5">日次</TabsTrigger>
          <TabsTrigger value="weekly" className="flex-1 text-xs md:text-sm py-1.5">週次</TabsTrigger>
          <TabsTrigger value="monthly" className="flex-1 text-xs md:text-sm py-1.5">月次</TabsTrigger>
          <TabsTrigger value="yearly" className="flex-1 text-xs md:text-sm py-1.5">年次</TabsTrigger>
        </TabsList>

        {/* ── 概要タブ ── */}
        <TabsContent value="overview" className="space-y-3 md:space-y-4">
          {/* KPI 2×2 on mobile, 4-col on desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
            <KpiCard
              label="本日の売上"
              value={`¥${dailyData.totalAmount.toLocaleString()}`}
              sub={`前日比 ${fmtRate(dailyData.comparisonRate)}`}
            />
            <KpiCard
              label="今週の売上"
              value={`¥${weeklyData.totalAmount.toLocaleString()}`}
              sub={`前週比 ${fmtRate(weeklyData.comparisonRate)}`}
            />
            <KpiCard
              label={`${format(selectedMonth, "M月", { locale: ja })}の売上`}
              value={`¥${monthlyData.totalAmount.toLocaleString()}`}
              sub={`前月比 ${fmtRate(monthlyData.comparisonRate)}`}
            />
            <KpiCard
              label="目標達成率"
              value={`${monthlyData.achievementRate.toFixed(1)}%`}
              sub={`目標 ¥${monthlyData.targetAmount.toLocaleString()}`}
            />
          </div>

          {/* Charts */}
          <div className="grid gap-3 md:gap-4 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader className="p-4 md:p-6 pb-2 md:pb-2">
                <CardTitle className="text-sm md:text-base">売上推移</CardTitle>
                <CardDescription className="text-xs">{format(selectedMonth, "yyyy年M月", { locale: ja })}</CardDescription>
              </CardHeader>
              <CardContent className="p-2 md:pl-2 md:pr-6 md:pb-6">
                <Overview />
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader className="p-4 md:p-6 pb-2 md:pb-2">
                <CardTitle className="text-sm md:text-base">製品別売上</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <SalesByProduct selectedMonth={selectedMonth} />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-3 md:gap-4 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader className="p-4 md:p-6 pb-2 md:pb-2">
                <CardTitle className="text-sm md:text-base">最近の売上</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-2">
                <RecentSales />
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader className="p-4 md:p-6 pb-2 md:pb-2">
                <CardTitle className="text-sm md:text-base">前年比較</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <SalesComparison />
              </CardContent>
            </Card>
          </div>

          {/* Profit - compact */}
          <Card>
            <CardHeader className="p-4 md:p-6 pb-2 md:pb-2">
              <CardTitle className="text-sm md:text-base">利益分析</CardTitle>
              <CardDescription className="text-xs">{format(selectedMonth, "yyyy年M月", { locale: ja })}</CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-2">
              <ProfitRow {...profitData} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── 日次タブ ── */}
        <TabsContent value="daily" className="space-y-3 md:space-y-4">
          <div className="grid grid-cols-2 gap-2 md:gap-4">
            <KpiCard
              label={activeData.periodLabel}
              value={`¥${activeData.totalAmount.toLocaleString()}`}
              sub={`${activeData.comparisonLabel} ${fmtRate(activeData.comparisonRate)}`}
            />
            <KpiCard
              label="目標達成率"
              value={`${activeData.achievementRate.toFixed(1)}%`}
              sub={`目標 ¥${activeData.targetAmount.toLocaleString()}`}
            />
          </div>
          <Card>
            <CardHeader className="p-4 md:p-6 pb-2">
              <CardTitle className="text-sm md:text-base">日次売上推移</CardTitle>
              <CardDescription className="text-xs">{format(selectedMonth, "yyyy年M月", { locale: ja })}</CardDescription>
            </CardHeader>
            <CardContent className="p-2 md:pl-2 md:pr-6 md:pb-6">
              <Overview />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4 md:p-6 pb-2">
              <CardTitle className="text-sm md:text-base">利益分析</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-2">
              <ProfitRow {...profitData} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── 週次タブ ── */}
        <TabsContent value="weekly" className="space-y-3 md:space-y-4">
          <div className="grid grid-cols-2 gap-2 md:gap-4">
            <KpiCard
              label={activeData.periodLabel}
              value={`¥${activeData.totalAmount.toLocaleString()}`}
              sub={`${activeData.comparisonLabel} ${fmtRate(activeData.comparisonRate)}`}
            />
            <KpiCard
              label="目標達成率"
              value={`${activeData.achievementRate.toFixed(1)}%`}
              sub={`目標 ¥${activeData.targetAmount.toLocaleString()}`}
            />
          </div>
          <Card>
            <CardHeader className="p-4 md:p-6 pb-2">
              <CardTitle className="text-sm md:text-base">週次売上推移</CardTitle>
              <CardDescription className="text-xs">{format(selectedMonth, "yyyy年M月", { locale: ja })}</CardDescription>
            </CardHeader>
            <CardContent className="p-2 md:pl-2 md:pr-6 md:pb-6">
              <Overview />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="p-4 md:p-6 pb-2">
              <CardTitle className="text-sm md:text-base">利益分析</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-2">
              <ProfitRow {...profitData} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── 月次タブ ── */}
        <TabsContent value="monthly" className="space-y-3 md:space-y-4">
          <div className="grid grid-cols-2 gap-2 md:gap-4">
            <KpiCard
              label={activeData.periodLabel}
              value={`¥${activeData.totalAmount.toLocaleString()}`}
              sub={`${activeData.comparisonLabel} ${fmtRate(activeData.comparisonRate)}`}
            />
            <KpiCard
              label="目標達成率"
              value={`${activeData.achievementRate.toFixed(1)}%`}
              sub={`目標 ¥${activeData.targetAmount.toLocaleString()}`}
            />
          </div>
          <div className="grid gap-3 md:gap-4 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader className="p-4 md:p-6 pb-2">
                <CardTitle className="text-sm md:text-base">月間売上推移</CardTitle>
              </CardHeader>
              <CardContent className="p-2 md:pl-2 md:pr-6 md:pb-6">
                <Overview />
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader className="p-4 md:p-6 pb-2">
                <CardTitle className="text-sm md:text-base">製品別売上</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <SalesByProduct selectedMonth={selectedMonth} />
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader className="p-4 md:p-6 pb-2">
              <CardTitle className="text-sm md:text-base">利益分析</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-2">
              <ProfitRow {...profitData} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── 年次タブ ── */}
        <TabsContent value="yearly" className="space-y-3 md:space-y-4">
          <div className="grid grid-cols-2 gap-2 md:gap-4">
            <KpiCard
              label={activeData.periodLabel}
              value={`¥${activeData.totalAmount.toLocaleString()}`}
              sub={`${activeData.comparisonLabel} ${fmtRate(activeData.comparisonRate)}`}
            />
            <KpiCard
              label="目標達成率"
              value={`${activeData.achievementRate.toFixed(1)}%`}
              sub={`目標 ¥${activeData.targetAmount.toLocaleString()}`}
            />
          </div>
          <div className="grid gap-3 md:gap-4 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader className="p-4 md:p-6 pb-2">
                <CardTitle className="text-sm md:text-base">年間売上推移</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <SalesComparison viewMode="yearly" />
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader className="p-4 md:p-6 pb-2">
                <CardTitle className="text-sm md:text-base">製品別売上</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <SalesByProduct selectedMonth={selectedMonth} />
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader className="p-4 md:p-6 pb-2">
              <CardTitle className="text-sm md:text-base">利益分析</CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-2">
              <ProfitRow {...profitData} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
