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

interface SalesByProductProps {
  selectedMonth: Date
}

// 製品名に基づく色パレット - より多くの色を用意
const DEFAULT_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-0))",
  "hsl(142, 76%, 36%)", // 緑
  "hsl(258, 90%, 66%)", // 紫
  "hsl(24, 95%, 53%)",  // オレンジ
  "hsl(199, 89%, 48%)", // ブルー
  "hsl(343, 81%, 54%)", // ピンク
  "hsl(48, 96%, 53%)",  // 黄色
]

export function SalesByProduct({ selectedMonth }: SalesByProductProps) {
  const { sales } = useSales()

  // 選択された月のデータをフィルタリング
  const filteredSales = sales.filter(
    (sale) =>
      sale.date.getFullYear() === selectedMonth.getFullYear() &&
      sale.date.getMonth() === selectedMonth.getMonth()
  )

  // 製品名別の売上を集計
  const productSales = new Map<string, number>()

  filteredSales.forEach((sale) => {
    const currentAmount = productSales.get(sale.productName) || 0
    productSales.set(sale.productName, currentAmount + sale.amount)
  })

  // 総売上を計算
  const totalSales = Array.from(productSales.values()).reduce((sum, amount) => sum + amount, 0)

  // グラフ用のデータ形式に変換
  const data = Array.from(productSales.entries())
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
                fill={DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
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
