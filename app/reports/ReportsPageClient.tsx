"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format, isThisWeek, startOfDay, endOfDay, isSameMonth, isSameYear } from "date-fns"
import { ja } from "date-fns/locale"
import { CalendarIcon, Download, FileText } from "lucide-react"
import { SalesComparison } from "@/components/dashboard/sales-comparison"
import { SalesByProduct } from "@/components/dashboard/sales-by-product"
import { Overview } from "@/components/dashboard/overview"
import { useSales } from "@/context/sales-context"
import { useSettings } from "@/context/settings-context"
import { usePurchases } from "@/context/purchases-context"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function ReportsPageClient() {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())
  const [activeTab, setActiveTab] = useState("monthly")
  const { sales, isLoading: salesLoading } = useSales()
  const { salesTargets } = useSettings()
  const { purchases, isLoading: purchasesLoading } = usePurchases()

  const isLoading = salesLoading || purchasesLoading

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
        // デフォルトは月次
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

  // 期間に応じた売上データの集計
  const calculateSalesData = (period: "daily" | "weekly" | "monthly" | "yearly") => {
    let filteredSales = []
    let periodLabel = ""
    let comparisonLabel = ""
    let targetAmount = 0

    switch (period) {
      case "daily":
        const now = new Date()
        if (isSameMonth(selectedMonth, now) && isSameYear(selectedMonth, now)) {
          filteredSales = sales.filter((sale) => sale.date >= startOfDay(now) && sale.date <= endOfDay(now))
          periodLabel = "本日の売上"
        } else {
          // 選択した月の最後の日のデータを表示
          const lastDayOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0)
          filteredSales = sales.filter(
            (sale) =>
              sale.date.getFullYear() === lastDayOfMonth.getFullYear() &&
              sale.date.getMonth() === lastDayOfMonth.getMonth() &&
              sale.date.getDate() === lastDayOfMonth.getDate(),
          )
          periodLabel = format(lastDayOfMonth, "M月d日", { locale: ja }) + "の売上"
        }
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
        periodLabel = format(selectedMonth, "yyyy年M月", { locale: ja }) + "の週次売上"
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
        periodLabel = format(selectedMonth, "yyyy年M月", { locale: ja }) + "の売上"
        comparisonLabel = "前月比"
        targetAmount = salesTargets.monthly
        break
      case "yearly":
        // 選択した月の年のデータ
        filteredSales = sales.filter((sale) => sale.date.getFullYear() === selectedMonth.getFullYear())
        periodLabel = format(selectedMonth, "yyyy年", { locale: ja }) + "の売上"
        comparisonLabel = "前年比"
        targetAmount = salesTargets.yearly
        break
      default:
        // デフォルトは月次
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

    // 販売数
    const salesCount = filteredSales.length

    // 平均購入額
    const averagePurchase = salesCount > 0 ? totalAmount / salesCount : 0

    // ダミーの比較データ (実際のアプリでは前期間のデータを計算)
    const comparisonRate = Math.random() * 10 - 2 // -2% から +8% の範囲でランダム

    return {
      totalAmount,
      salesCount,
      averagePurchase,
      periodLabel,
      comparisonLabel,
      comparisonRate,
      achievementRate,
      targetAmount,
      filteredSales,
    }
  }

  // アクティブなタブに応じたデータを取得
  const salesData = calculateSalesData(activeTab as any)

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  // 最も売れた製品を取得
  const getTopSellingProduct = () => {
    const productSales = new Map<string, number>()

    salesData.filteredSales.forEach((sale) => {
      const currentAmount = productSales.get(sale.productName) || 0
      productSales.set(sale.productName, currentAmount + sale.amount)
    })

    let topProduct = { name: "なし", amount: 0 }

    productSales.forEach((amount, name) => {
      if (amount > topProduct.amount) {
        topProduct = { name, amount }
      }
    })

    return topProduct.name
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
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">レポート</h2>
          <p className="text-muted-foreground">CBD製品の売上レポートを生成・閲覧します。</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant={"outline"} className={cn("justify-start text-left font-normal")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedMonth, "yyyy年M月", { locale: ja })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="month"
                selected={selectedMonth}
                onSelect={(date) => date && setSelectedMonth(date)}
                initialFocus
                locale={ja}
              />
            </PopoverContent>
          </Popover>
          <Button>
            <FileText className="mr-2 h-4 w-4" /> レポート生成
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> PDF出力
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto pb-2">
        <Tabs defaultValue="monthly" className="space-y-4" onValueChange={handleTabChange}>
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="daily" className="flex-1 sm:flex-none">
              日次レポート
            </TabsTrigger>
            <TabsTrigger value="weekly" className="flex-1 sm:flex-none">
              週次レポート
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex-1 sm:flex-none">
              月次レポート
            </TabsTrigger>
            <TabsTrigger value="yearly" className="flex-1 sm:flex-none">
              年次レポート
            </TabsTrigger>
          </TabsList>

          {/* 日次レポートタブ */}
          <TabsContent value="daily" className="space-y-4">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
                  <CardTitle className="text-sm font-medium">販売数</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{salesData.salesCount}件</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">平均購入額</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ¥
                    {salesData.averagePurchase.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">目標達成率</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{salesData.achievementRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">目標: ¥{salesData.targetAmount.toLocaleString()}</p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>日次売上推移</CardTitle>
                <CardDescription>{salesData.periodLabel}の時間帯別売上推移</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>利益分析</CardTitle>
                <CardDescription>{salesData.periodLabel}の売上・仕入れ・利益</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-2">売上合計</h3>
                    <p className="text-2xl font-bold">¥{calculateProfit("daily").totalSales.toLocaleString()}</p>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-2">仕入れ合計</h3>
                    <p className="text-2xl font-bold">¥{calculateProfit("daily").totalPurchases.toLocaleString()}</p>
                  </div>
                  <div
                    className={`p-4 rounded-lg ${calculateProfit("daily").profit >= 0 ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}
                  >
                    <h3 className="text-sm font-medium mb-2">利益</h3>
                    <p className="text-2xl font-bold">¥{calculateProfit("daily").profit.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      利益率: {calculateProfit("daily").profitRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 週次レポートタブ */}
          <TabsContent value="weekly" className="space-y-4">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
                  <CardTitle className="text-sm font-medium">販売数</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{salesData.salesCount}件</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">平均購入額</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ¥
                    {salesData.averagePurchase.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">目標達成率</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{salesData.achievementRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">目標: ¥{salesData.targetAmount.toLocaleString()}</p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
              <Card className="col-span-1 lg:col-span-4">
                <CardHeader>
                  <CardTitle>週間売上推移</CardTitle>
                  <CardDescription>{salesData.periodLabel}の日別売上推移</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <Overview />
                </CardContent>
              </Card>
              <Card className="col-span-1 lg:col-span-3">
                <CardHeader>
                  <CardTitle>製品別売上比率</CardTitle>
                  <CardDescription>{salesData.periodLabel}の製品カテゴリ別売上比率</CardDescription>
                </CardHeader>
                <CardContent>
                  <SalesByProduct selectedMonth={selectedMonth} />
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>利益分析</CardTitle>
                <CardDescription>{salesData.periodLabel}の売上・仕入れ・利益</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-2">売上合計</h3>
                    <p className="text-2xl font-bold">¥{calculateProfit("weekly").totalSales.toLocaleString()}</p>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-2">仕入れ合計</h3>
                    <p className="text-2xl font-bold">¥{calculateProfit("weekly").totalPurchases.toLocaleString()}</p>
                  </div>
                  <div
                    className={`p-4 rounded-lg ${calculateProfit("weekly").profit >= 0 ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}
                  >
                    <h3 className="text-sm font-medium mb-2">利益</h3>
                    <p className="text-2xl font-bold">¥{calculateProfit("weekly").profit.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      利益率: {calculateProfit("weekly").profitRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 月次レポートタブ */}
          <TabsContent value="monthly" className="space-y-4">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">総売上</CardTitle>
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
                  <CardTitle className="text-sm font-medium">販売数</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{salesData.salesCount}件</div>
                  <p className="text-xs text-muted-foreground">
                    {salesData.comparisonLabel} {salesData.comparisonRate > 0 ? "+" : ""}
                    {salesData.comparisonRate.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">平均購入額</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ¥{salesData.averagePurchase.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </div>
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
                  <p className="text-xs text-muted-foreground">目標: ¥{salesData.targetAmount.toLocaleString()}</p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
              <Card className="col-span-1 lg:col-span-4">
                <CardHeader>
                  <CardTitle>月間売上推移</CardTitle>
                  <CardDescription>{salesData.periodLabel}の日次売上推移</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <Overview />
                </CardContent>
              </Card>
              <Card className="col-span-1 lg:col-span-3">
                <CardHeader>
                  <CardTitle>製品別売上比率</CardTitle>
                  <CardDescription>{salesData.periodLabel}の製品カテゴリ別売上比率</CardDescription>
                </CardHeader>
                <CardContent>
                  <SalesByProduct selectedMonth={selectedMonth} />
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>利益分析</CardTitle>
                <CardDescription>{salesData.periodLabel}の売上・仕入れ・利益</CardDescription>
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
            <Card>
              <CardHeader>
                <CardTitle>前年同月比較</CardTitle>
                <CardDescription>前年同月との売上比較</CardDescription>
              </CardHeader>
              <CardContent>
                <SalesComparison />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>月次レポートサマリー</CardTitle>
                <CardDescription>{salesData.periodLabel}の売上サマリー</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">主要指標</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      総売上: ¥{salesData.totalAmount.toLocaleString()} ({salesData.comparisonLabel}{" "}
                      {salesData.comparisonRate > 0 ? "+" : ""}
                      {salesData.comparisonRate.toFixed(1)}%)
                    </li>
                    <li>
                      販売数: {salesData.salesCount}件 ({salesData.comparisonLabel}{" "}
                      {salesData.comparisonRate > 0 ? "+" : ""}
                      {salesData.comparisonRate.toFixed(1)}%)
                    </li>
                    <li>
                      平均購入額: ¥{salesData.averagePurchase.toLocaleString(undefined, { maximumFractionDigits: 0 })} (
                      {salesData.comparisonLabel} {salesData.comparisonRate > 0 ? "+" : ""}
                      {salesData.comparisonRate.toFixed(1)}%)
                    </li>
                    <li>最も売れた製品: {getTopSellingProduct()}</li>
                    <li>売上成長率: {salesData.comparisonRate.toFixed(1)}% (前年同月比)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">分析結果</h4>
                  {salesData.salesCount > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {salesData.periodLabel}は{salesData.comparisonRate > 0 ? "好調" : "低調"}
                      で、
                      {salesData.comparisonRate > 0
                        ? `前月比${salesData.comparisonRate.toFixed(1)}%増`
                        : `前月比${Math.abs(salesData.comparisonRate).toFixed(1)}%減`}
                      となりました。 目標達成率は{salesData.achievementRate.toFixed(1)}%です。
                      {salesData.achievementRate >= 100
                        ? "目標を達成しました。"
                        : "引き続き販売促進活動を強化しましょう。"}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      現在、売上データがありません。データが追加されると、ここに分析結果が表示されます。
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 年次レポートタブ */}
          <TabsContent value="yearly" className="space-y-4">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">年間売上</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">¥{salesData.totalAmount.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    前年比 {salesData.comparisonRate > 0 ? "+" : ""}
                    {salesData.comparisonRate.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">販売数</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{salesData.salesCount}件</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">平均購入額</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ¥
                    {salesData.averagePurchase.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">目標達成率</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{salesData.achievementRate.toFixed(1)}%</div>
                  <p className="text-xs text-muted-foreground">目標: ¥{salesData.targetAmount.toLocaleString()}</p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
              <Card className="col-span-1 lg:col-span-4">
                <CardHeader>
                  <CardTitle>年間売上推移</CardTitle>
                  <CardDescription>{salesData.periodLabel}の月別売上推移</CardDescription>
                </CardHeader>
                <CardContent>
                  <SalesComparison />
                </CardContent>
              </Card>
              <Card className="col-span-1 lg:col-span-3">
                <CardHeader>
                  <CardTitle>製品別売上比率</CardTitle>
                  <CardDescription>{salesData.periodLabel}の製品カテゴリ別売上比率</CardDescription>
                </CardHeader>
                <CardContent>
                  <SalesByProduct selectedMonth={selectedMonth} />
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>利益分析</CardTitle>
                <CardDescription>{salesData.periodLabel}の売上・仕入れ・利益</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-2">売上合計</h3>
                    <p className="text-2xl font-bold">¥{calculateProfit("yearly").totalSales.toLocaleString()}</p>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h3 className="text-sm font-medium mb-2">仕入れ合計</h3>
                    <p className="text-2xl font-bold">¥{calculateProfit("yearly").totalPurchases.toLocaleString()}</p>
                  </div>
                  <div
                    className={`p-4 rounded-lg ${calculateProfit("yearly").profit >= 0 ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30"}`}
                  >
                    <h3 className="text-sm font-medium mb-2">利益</h3>
                    <p className="text-2xl font-bold">¥{calculateProfit("yearly").profit.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      利益率: {calculateProfit("yearly").profitRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>年次レポートサマリー</CardTitle>
                <CardDescription>{salesData.periodLabel}のサマリー</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">主要指標</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      総売上: ¥{salesData.totalAmount.toLocaleString()} ({salesData.comparisonLabel}{" "}
                      {salesData.comparisonRate > 0 ? "+" : ""}
                      {salesData.comparisonRate.toFixed(1)}%)
                    </li>
                    <li>
                      販売数: {salesData.salesCount}件 ({salesData.comparisonLabel}{" "}
                      {salesData.comparisonRate > 0 ? "+" : ""}
                      {salesData.comparisonRate.toFixed(1)}%)
                    </li>
                    <li>
                      平均購入額: ¥{salesData.averagePurchase.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </li>
                    <li>最も売れた製品: {getTopSellingProduct()}</li>
                    <li>売上成長率: {salesData.comparisonRate.toFixed(1)}% (前年比)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">分析結果</h4>
                  {salesData.salesCount > 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {salesData.periodLabel}は{salesData.comparisonRate > 0 ? "好調" : "低調"}
                      で、
                      {salesData.comparisonRate > 0
                        ? `前年比${salesData.comparisonRate.toFixed(1)}%増`
                        : `前年比${Math.abs(salesData.comparisonRate).toFixed(1)}%減`}
                      となりました。 目標達成率は{salesData.achievementRate.toFixed(1)}%です。
                      {salesData.achievementRate >= 100
                        ? "目標を達成しました。"
                        : "引き続き販売促進活動を強化しましょう。"}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      現在、売上データがありません。データが追加されると、ここに分析結果が表示されます。
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
