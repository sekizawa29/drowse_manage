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

  // 製品名を省略する関数
  const truncateProductName = (name: string, maxLength: number = 15) => {
    if (name.length <= maxLength) return name
    return name.substring(0, maxLength) + "..."
  }

  // 総売上を計算
  const totalSales = Array.from(productSales.values()).reduce((sum, amount) => sum + amount, 0)

  // グラフ用のデータ形式に変換
  const data = Array.from(productSales.entries())
    .map(([name, amount]) => ({
      name,
      fullName: name, // 完全な製品名を保持
      truncatedName: truncateProductName(name), // 省略された製品名
      value: amount,
      percentage: Math.round((amount / totalSales) * 100),
    }))
    .sort((a, b) => b.value - a.value) // 値が大きい順にソート

  // データがない場合のフォールバック
  if (data.length === 0) {
    return <div className="flex items-center justify-center h-[300px] text-muted-foreground">データがありません</div>
  }

  return (
    <div className="h-[300px] flex flex-col lg:flex-row gap-4">
      {/* 円グラフ */}
      <div className="flex-1 min-h-[200px]">
        <ChartContainer
          config={{
            value: {
              label: "売上比率",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={60}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ percentage }) => percentage >= 10 ? `${percentage}%` : ""}
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
                      props.payload.fullName || name,
                    ]}
                  />
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>

      {/* カスタム凡例 */}
      <div className="w-full lg:w-48 flex flex-col justify-center">
        <div className="space-y-2 text-sm">
          {data.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: DEFAULT_COLORS[index % DEFAULT_COLORS.length] }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-xs truncate" title={entry.fullName}>
                  {entry.truncatedName}
                </div>
                <div className="text-xs text-muted-foreground">
                  ¥{entry.value.toLocaleString()}
                </div>
                <div className="text-xs font-medium">
                  {entry.percentage}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
