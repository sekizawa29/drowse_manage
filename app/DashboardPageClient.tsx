"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Overview } from "@/components/dashboard/overview"
import { RecentSales } from "@/components/dashboard/recent-sales"
import { SalesByProduct } from "@/components/dashboard/sales-by-product"
import { SalesComparison } from "@/components/dashboard/sales-comparison"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { useSales } from "@/context/sales-context"
import { useSettings } from "@/context/settings-context"
import { isThisWeek, startOfDay, endOfDay, isSameMonth, isSameYear } from "date-fns"
import { ja } from "date-fns/locale"
import { usePurchases } from "@/context/purchases-context"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { format } from "date-fns"

export default function DashboardPageClient() {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())
  const [activeTab, setActiveTab] = useState("overview")
  const { sales, isLoading: salesLoading } = useSales()
  const { salesTargets } = useSettings()
  const { purchases, isLoading: purchasesLoading } = usePurchases()

  const isLoading = salesLoading || purchasesLoading

  // 期間に応じた売上データの集計
  const calculateSalesData = (period: "daily" | "weekly" | "monthly" | "yearly") => {
    const now = new Date()
    let filteredSales = []
    let periodLabel = ""
    let comparisonLabel = ""
    let targetAmount = 0

    switch (period) {
      case "daily":
        // 選択した月の最新の日のデータ（または今日のデータ）
        if (isSameMonth(selectedMonth, now) && isSameYear(selectedMonth, now)) {
          filteredSales = sales.filter((sale) => sale.date >= startOfDay(now) && sale.date <= endOfDay(now))
        } else {
          // 選択した月の最後の日のデータを表示
          const lastDayOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0)
          filteredSales = sales.filter(
            (sale) =>
              sale.date.getFullYear() === lastDayOfMonth.getFullYear() &&
              sale.date.getMonth() === lastDayOfMonth.getMonth() &&
              sale.date.getDate() === lastDayOfMonth.getDate(),
          )
        }
        periodLabel = "日次売上"
        comparisonLabel = "前日比"
        targetAmount = salesTargets.daily
        break
      case "weekly":
        // 選択した月の週のデータ
        filteredSales = sales.filter(
          (sale) =>
            sale.date.getFullYear() === selectedMonth.getFullYear() &&
            sale.date.getMonth() === selectedMonth.getMonth() &&
            isThisWeek(sale.date, { locale: ja }),
        )
        periodLabel = "週次売上"
        comparisonLabel = "前週比"
        targetAmount = salesTargets.weekly
        break
      case "monthly":
        // 選択した月のデータ
        filteredSales = sales.filter(
          (sale) =>
            sale.date.getFullYear() === selectedMonth.getFullYear() &&
            sale.date.getMonth() === selectedMonth.getMonth(),
        )
        periodLabel = "月次売上"
        comparisonLabel = "前月比"
        targetAmount = salesTargets.monthly
        break
      case "yearly":
        // 選択した月の年のデータ
        filteredSales = sales.filter((sale) => sale.date.getFullYear() === selectedMonth.getFullYear())
        periodLabel = "年次売上"
        comparisonLabel = "前年比"
        targetAmount = salesTargets.yearly
        break
      default:
        // overview タブの場合は選択した月のデータ
        filteredSales = sales.filter(
          (sale) =>
            sale.date.getFullYear() === selectedMonth.getFullYear() &&
            sale.date.getMonth() === selectedMonth.getMonth(),
        )
        periodLabel = format(selectedMonth, "yyyy年M月", { locale: ja }) + "の売上"
        comparisonLabel = "前月比"
        targetAmount = salesTargets.monthly
    }

    const totalAmount = filteredSales.reduce((sum, sale) => sum + sale.amount, 0)
    const achievementRate = (totalAmount / targetAmount) * 100

    // ダミーの比較データ (実際のアプリでは前期間のデータを計算)
    const comparisonRate = Math.random() * 10 - 2 // -2% から +8% の範囲でランダム

    return {
      totalAmount,
      periodLabel,
      comparisonLabel,
      comparisonRate,
      achievementRate,
      targetAmount,
      filteredSales,
    }
  }

  // 利益/損益を計算する関数
  const calculateProfit = (period: "daily" | "weekly" | "monthly" | "yearly") => {
    let filteredSales = []
    let filteredPurchases = []

    switch (period) {
      case "daily":
        const now = new Date()
        if (isSameMonth(selectedMonth, now) && isSameYear(selectedMonth, now)) {
          filteredSales = sales.filter((sale) => sale.date >= startOfDay(now) && sale.date <= endOfDay(now))
          filteredPurchases = purchases.filter(
            (purchase) => purchase.date >= startOfDay(now) && purchase.date <= endOfDay(now),
          )
        } else {
          // 選択した月の最後の日のデータを表示
          const lastDayOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0)
          filteredSales = sales.filter(
            (sale) =>
              sale.date.getFullYear() === lastDayOfMonth.getFullYear() &&
              sale.date.getMonth() === lastDayOfMonth.getMonth() &&
              sale.date.getDate() === lastDayOfMonth.getDate(),
          )
          filteredPurchases = purchases.filter(
            (purchase) =>
              purchase.date.getFullYear() === lastDayOfMonth.getFullYear() &&
              purchase.date.getMonth() === lastDayOfMonth.getMonth() &&
              purchase.date.getDate() === lastDayOfMonth.getDate(),
          )
        }
        break
      case "weekly":
        // 選択した月の週のデータ
        filteredSales = sales.filter(
          (sale) =>
            sale.date.getFullYear() === selectedMonth.getFullYear() &&
            sale.date.getMonth() === selectedMonth.getMonth() &&
            isThisWeek(sale.date, { locale: ja }),
        )
        filteredPurchases = purchases.filter(
          (purchase) =>
            purchase.date.getFullYear() === selectedMonth.getFullYear() &&
            purchase.date.getMonth() === selectedMonth.getMonth() &&
            isThisWeek(purchase.date, { locale: ja }),
        )
        break
      case "monthly":
        // 選択した月のデータ
        filteredSales = sales.filter(
          (sale) =>
            sale.date.getFullYear() === selectedMonth.getFullYear() &&
            sale.date.getMonth() === selectedMonth.getMonth(),
        )
        filteredPurchases = purchases.filter(
          (purchase) =>
            purchase.date.getFullYear() === selectedMonth.getFullYear() &&
            purchase.date.getMonth() === selectedMonth.getMonth(),
        )
        break
      case "yearly":
        // 選択した月の年のデータ
        filteredSales = sales.filter((sale) => sale.date.getFullYear() === selectedMonth.getFullYear())
        filteredPurchases = purchases.filter((purchase) => purchase.date.getFullYear() === selectedMonth.getFullYear())
        break
      default:
        // overview タブの場合は選択した月のデータ
        filteredSales = sales.filter(
          (sale) =>
            sale.date.getFullYear() === selectedMonth.getFullYear() &&
            sale.date.getMonth() === selectedMonth.getMonth(),
        )
        filteredPurchases = purchases.filter(
          (purchase) =>
            purchase.date.getFullYear() === selectedMonth.getFullYear() &&
            purchase.date.getMonth() === selectedMonth.getMonth(),
        )
    }

    const totalSales = filteredSales.reduce((sum, sale) => sum + sale.amount, 0)
    const totalPurchases = filteredPurchases.reduce((sum, purchase) => sum + purchase.amount, 0)
    const profit = totalSales - totalPurchases
    const profitRate = totalSales > 0 ? (profit / totalSales) * 100 : 0

    return {
      totalSales,
      totalPurchases,
      profit,
      profitRate,
    }
  }

  // アクティブなタブに応じたデータを取得
  const salesData = calculateSalesData(activeTab as any)

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  const handleMonthChange = (date: Date) => {
    setSelectedMonth(date)
  }

  if (isLoading) {
    return (
      <div className="flex-1 p-4 md:p-8 pt-6">
        <LoadingSpinner text="データを読み込み中..." />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <DashboardHeader selectedMonth={selectedMonth} onMonthChange={handleMonthChange} />
      <Tabs defaultValue="overview" className="space-y-4" onValueChange={handleTabChange}>
        <div className="overflow-x-auto pb-2">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="overview" className="flex-1 sm:flex-none">
              概要
            </TabsTrigger>
            <TabsTrigger value="daily" className="flex-1 sm:flex-none">
              日次
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex-1 sm:flex-none">
              週次
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex-1 sm:flex-none">
              月次
            </TabsTrigger>
            <TabsTrigger value="yearly" className="flex-1 sm:flex-none">
              年次
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">本日の売上</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">¥{calculateSalesData("daily").totalAmount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  前日比 {calculateSalesData("daily").comparisonRate > 0 ? "+" : ""}
                  {calculateSalesData("daily").comparisonRate.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">今週の売上</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">¥{calculateSalesData("weekly").totalAmount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  前週比 {calculateSalesData("weekly").comparisonRate > 0 ? "+" : ""}
                  {calculateSalesData("weekly").comparisonRate.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {format(selectedMonth, "M月", { locale: ja })}の売上
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">¥{calculateSalesData("monthly").totalAmount.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  前月比 {calculateSalesData("monthly").comparisonRate > 0 ? "+" : ""}
                  {calculateSalesData("monthly").comparisonRate.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">目標達成率</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{calculateSalesData("monthly").achievementRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  月間目標: ¥{calculateSalesData("monthly").targetAmount.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-full lg:col-span-4">
              <CardHeader>
                <CardTitle>売上推移</CardTitle>
                <CardDescription>{format(selectedMonth, "yyyy年M月", { locale: ja })}の日次売上推移</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview />
              </CardContent>
            </Card>
            <Card className="col-span-full lg:col-span-3">
              <CardHeader>
                <CardTitle>製品別売上比率</CardTitle>
                <CardDescription>
                  {format(selectedMonth, "yyyy年M月", { locale: ja })}の製品カテゴリ別売上比率
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SalesByProduct />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-full lg:col-span-4">
              <CardHeader>
                <CardTitle>最近の売上</CardTitle>
                <CardDescription>{format(selectedMonth, "yyyy年M月", { locale: ja })}の売上データ</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentSales />
              </CardContent>
            </Card>
            <Card className="col-span-full lg:col-span-3">
              <CardHeader>
                <CardTitle>売上比較</CardTitle>
                <CardDescription>前年同月比較</CardDescription>
              </CardHeader>
              <CardContent>
                <SalesComparison />
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>利益分析</CardTitle>
              <CardDescription>
                {format(selectedMonth, "yyyy年M月", { locale: ja })}の売上・仕入れ・利益
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-2">売上合計</h3>
                  <p className="text-2xl font-bold">¥{calculateProfit("monthly").totalSales.toLocaleString()}</p>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-2">仕入れ合計</h3>
                  <p className="text-2xl font-bold">¥{calculateProfit("monthly").totalPurchases.toLocaleString()}</p>
                </div>
                <div
                  className={`p-4 rounded-lg ${calculateProfit("monthly").profit >= 0 ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}
                >
                  <h3 className="text-sm font-medium mb-2">利益</h3>
                  <p className="text-2xl font-bold">¥{calculateProfit("monthly").profit.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    利益率: {calculateProfit("monthly").profitRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 日次タブコンテンツ */}
        <TabsContent value="daily" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>日次売上データ</CardTitle>
              <CardDescription>
                {format(selectedMonth, "yyyy年M月", { locale: ja })}の日別売上データを表示します
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{salesData.periodLabel}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">¥{salesData.totalAmount.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      {salesData.comparisonLabel} {salesData.comparisonRate > 0 ? "+" : ""}
                      {salesData.comparisonRate.toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>
              </div>
              <Overview />
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">利益分析</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-2">売上合計</h3>
                    <p className="text-2xl font-bold">
                      ¥{calculateProfit(activeTab as any).totalSales.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-2">仕入れ合計</h3>
                    <p className="text-2xl font-bold">
                      ¥{calculateProfit(activeTab as any).totalPurchases.toLocaleString()}
                    </p>
                  </div>
                  <div
                    className={`p-4 rounded-lg ${calculateProfit(activeTab as any).profit >= 0 ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}
                  >
                    <h3 className="text-sm font-medium mb-2">利益</h3>
                    <p className="text-2xl font-bold">¥{calculateProfit(activeTab as any).profit.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      利益率: {calculateProfit(activeTab as any).profitRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 週次タブコンテンツ */}
        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>週次売上データ</CardTitle>
              <CardDescription>
                {format(selectedMonth, "yyyy年M月", { locale: ja })}の週別売上データを表示します
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{salesData.periodLabel}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">¥{salesData.totalAmount.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      {salesData.comparisonLabel} {salesData.comparisonRate > 0 ? "+" : ""}
                      {salesData.comparisonRate.toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">目標達成率</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{salesData.achievementRate.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">
                      週間目標: ¥{salesData.targetAmount.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              </div>
              <Overview />
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">利益分析</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-2">売上合計</h3>
                    <p className="text-2xl font-bold">
                      ¥{calculateProfit(activeTab as any).totalSales.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-2">仕入れ合計</h3>
                    <p className="text-2xl font-bold">
                      ¥{calculateProfit(activeTab as any).totalPurchases.toLocaleString()}
                    </p>
                  </div>
                  <div
                    className={`p-4 rounded-lg ${calculateProfit(activeTab as any).profit >= 0 ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}
                  >
                    <h3 className="text-sm font-medium mb-2">利益</h3>
                    <p className="text-2xl font-bold">¥{calculateProfit(activeTab as any).profit.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      利益率: {calculateProfit(activeTab as any).profitRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 月次タブコンテンツ */}
        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>月次売上データ</CardTitle>
              <CardDescription>
                {format(selectedMonth, "yyyy年M月", { locale: ja })}の月別売上データを表示します
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{salesData.periodLabel}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">¥{salesData.totalAmount.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      {salesData.comparisonLabel} {salesData.comparisonRate > 0 ? "+" : ""}
                      {salesData.comparisonRate.toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">目標達成率</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{salesData.achievementRate.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">
                      月間目標: ¥{salesData.targetAmount.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mb-6">
                <Card className="col-span-full lg:col-span-4">
                  <CardHeader>
                    <CardTitle>月間売上推移</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Overview />
                  </CardContent>
                </Card>
                <Card className="col-span-full lg:col-span-3">
                  <CardHeader>
                    <CardTitle>製品別売上比率</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SalesByProduct />
                  </CardContent>
                </Card>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">利益分析</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-2">売上合計</h3>
                    <p className="text-2xl font-bold">
                      ¥{calculateProfit(activeTab as any).totalSales.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-2">仕入れ合計</h3>
                    <p className="text-2xl font-bold">
                      ¥{calculateProfit(activeTab as any).totalPurchases.toLocaleString()}
                    </p>
                  </div>
                  <div
                    className={`p-4 rounded-lg ${calculateProfit(activeTab as any).profit >= 0 ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}
                  >
                    <h3 className="text-sm font-medium mb-2">利益</h3>
                    <p className="text-2xl font-bold">¥{calculateProfit(activeTab as any).profit.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      利益率: {calculateProfit(activeTab as any).profitRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 年次タブコンテンツ */}
        <TabsContent value="yearly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>年次売上データ</CardTitle>
              <CardDescription>
                {format(selectedMonth, "yyyy年", { locale: ja })}の年間売上データを表示します
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{salesData.periodLabel}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">¥{salesData.totalAmount.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      {salesData.comparisonLabel} {salesData.comparisonRate > 0 ? "+" : ""}
                      {salesData.comparisonRate.toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">目標達成率</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{salesData.achievementRate.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">
                      年間目標: ¥{salesData.targetAmount.toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mb-6">
                <Card className="col-span-full lg:col-span-4">
                  <CardHeader>
                    <CardTitle>年間売上推移</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SalesComparison viewMode="yearly" />
                  </CardContent>
                </Card>
                <Card className="col-span-full lg:col-span-3">
                  <CardHeader>
                    <CardTitle>製品別売上比率</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SalesByProduct />
                  </CardContent>
                </Card>
              </div>
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">利益分析</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-2">売上合計</h3>
                    <p className="text-2xl font-bold">
                      ¥{calculateProfit(activeTab as any).totalSales.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-2">仕入れ合計</h3>
                    <p className="text-2xl font-bold">
                      ¥{calculateProfit(activeTab as any).totalPurchases.toLocaleString()}
                    </p>
                  </div>
                  <div
                    className={`p-4 rounded-lg ${calculateProfit(activeTab as any).profit >= 0 ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}
                  >
                    <h3 className="text-sm font-medium mb-2">利益</h3>
                    <p className="text-2xl font-bold">¥{calculateProfit(activeTab as any).profit.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      利益率: {calculateProfit(activeTab as any).profitRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
