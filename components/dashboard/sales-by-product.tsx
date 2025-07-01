"use client"

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useSales } from "@/context/sales-context"
import { CHART_COLOR_PALETTE, CHART_CONFIG } from "@/constants/ui-constants"
import { truncateProductName } from "@/utils/product-name-utils"

interface SalesByProductProps {
  selectedMonth: Date
}

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
                outerRadius={CHART_CONFIG.OUTER_RADIUS}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ percentage }) => percentage >= CHART_CONFIG.MIN_PERCENTAGE_FOR_LABEL ? `${percentage}%` : ""}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length]}
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
                style={{ backgroundColor: CHART_COLOR_PALETTE[index % CHART_COLOR_PALETTE.length] }}
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
