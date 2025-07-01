"use client"

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useSales } from "@/context/sales-context"

// 色のパレット - カテゴリに合わせて色を設定
const COLORS = {
  CBD: "hsl(var(--chart-1))",
  CBN: "hsl(var(--chart-2))",
  CBG: "hsl(var(--chart-3))",
  その他: "hsl(var(--chart-4))",
}

// デフォルトの色
const DEFAULT_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-0))",
]

export function SalesByProduct() {
  const { sales } = useSales()

  // カテゴリ別の売上を集計
  const categorySales = new Map<string, number>()

  sales.forEach((sale) => {
    const currentAmount = categorySales.get(sale.category) || 0
    categorySales.set(sale.category, currentAmount + sale.amount)
  })

  // 総売上を計算
  const totalSales = Array.from(categorySales.values()).reduce((sum, amount) => sum + amount, 0)

  // グラフ用のデータ形式に変換
  const data = Array.from(categorySales.entries())
    .map(([name, amount]) => ({
      name,
      value: amount,
      percentage: Math.round((amount / totalSales) * 100),
    }))
    .sort((a, b) => b.value - a.value) // 値が大きい順にソート

  // データがない場合のフォールバック
  if (data.length === 0) {
    return <div className="flex items-center justify-center h-[300px] text-muted-foreground">データがありません</div>
  }

  return (
    <ChartContainer
      config={{
        value: {
          label: "売上比率",
          color: "hsl(var(--chart-1))",
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percentage }) => `${name} ${percentage}%`}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[entry.name as keyof typeof COLORS] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              />
            ))}
          </Pie>
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value: number, name: string, props: any) => [
                  `¥${value.toLocaleString()} (${props.percentage}%)`,
                  name,
                ]}
              />
            }
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
