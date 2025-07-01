"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useSales } from "@/context/sales-context"
import { format, subDays } from "date-fns"

export function Overview() {
  const { sales } = useSales()

  // 過去30日間のデータを集計
  const today = new Date()
  const thirtyDaysAgo = subDays(today, 30)

  // 日付ごとの売上を集計
  const dailySales = new Map<string, number>()

  // 過去30日間の日付を初期化
  for (let i = 0; i < 30; i++) {
    const date = subDays(today, i)
    const dateKey = format(date, "M/d")
    dailySales.set(dateKey, 0)
  }

  // 売上データを集計
  sales.forEach((sale) => {
    if (sale.date >= thirtyDaysAgo && sale.date <= today) {
      const dateKey = format(sale.date, "M/d")
      const currentAmount = dailySales.get(dateKey) || 0
      dailySales.set(dateKey, currentAmount + sale.amount)
    }
  })

  // グラフ用のデータ形式に変換
  const data = Array.from(dailySales.entries())
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => {
      // 日付でソート (M/d形式なので、一度Dateに変換)
      const dateA = new Date(`2024/${a.name}`)
      const dateB = new Date(`2024/${b.name}`)
      return dateA.getTime() - dateB.getTime()
    })
    .slice(-14) // 直近14日間のみ表示

  return (
    <ChartContainer
      config={{
        total: {
          label: "売上",
          color: "hsl(var(--chart-1))",
        },
      }}
      className="h-[350px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
              <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `¥${value.toLocaleString()}`}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value: number) => [`¥${value.toLocaleString()}`, "売上"]}
                labelFormatter={(label) => `${label}日`}
              />
            }
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="hsl(var(--chart-1))"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorTotal)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
