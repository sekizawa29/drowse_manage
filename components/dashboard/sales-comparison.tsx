"use client"

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useSales } from "@/context/sales-context"
import { format, getYear, subMonths } from "date-fns"

interface SalesComparisonProps {
  viewMode?: "monthly" | "yearly"
}

export function SalesComparison({ viewMode = "monthly" }: SalesComparisonProps) {
  const { sales } = useSales()

  // 現在の月と前年同月のデータを集計
  const today = new Date()
  const currentYear = getYear(today)
  const previousYear = currentYear - 1

  // 月ごとの売上を集計
  const monthlySales = new Map<string, { 今年: number; 前年: number }>()

  // 表示期間を決定（年次表示なら12ヶ月、月次表示なら3ヶ月）
  const monthsToShow = viewMode === "yearly" ? 12 : 3
  
  // 指定した期間の月を初期化
  for (let i = 0; i < monthsToShow; i++) {
    const date = subMonths(today, i)
    const monthKey = format(date, "M月")
    monthlySales.set(monthKey, { 今年: 0, 前年: 0 })
  }

  // 売上データを集計
  sales.forEach((sale) => {
    const saleYear = getYear(sale.date)
    const monthKey = format(sale.date, "M月")

    if (monthlySales.has(monthKey)) {
      const currentData = monthlySales.get(monthKey)!

      if (saleYear === currentYear) {
        currentData.今年 += sale.amount
      } else if (saleYear === previousYear) {
        currentData.前年 += sale.amount
      }

      monthlySales.set(monthKey, currentData)
    }
  })

  // グラフ用のデータ形式に変換
  const data = Array.from(monthlySales.entries())
    .map(([name, values]) => ({ name, ...values }))
    .sort((a, b) => {
      // 月でソート
      const monthA = Number.parseInt(a.name.replace("月", ""))
      const monthB = Number.parseInt(b.name.replace("月", ""))
      return monthA - monthB
    })

  // データがない場合のフォールバック
  if (data.every((item) => item.今年 === 0 && item.前年 === 0)) {
    return <div className="flex items-center justify-center h-[300px] text-muted-foreground">データがありません</div>
  }

  return (
    <ChartContainer
      config={{
        今年: {
          label: "今年",
          color: "hsl(var(--chart-1))",
        },
        前年: {
          label: "前年",
          color: "hsl(var(--chart-4))",
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(value) => `¥${(value / 10000).toFixed(0)}万`} />
          <ChartTooltip
            content={
              <ChartTooltipContent formatter={(value: number, name: string) => [`¥${value.toLocaleString()}`, name]} />
            }
          />
          <Legend />
          <Bar dataKey="今年" fill="var(--color-今年)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="前年" fill="var(--color-前年)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
