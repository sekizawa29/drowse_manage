import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SalesData } from "@/types/common"

interface SalesMetricsCardsProps {
  salesData: SalesData
}

export function SalesMetricsCards({ salesData }: SalesMetricsCardsProps) {
  return (
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
      
      {salesData.targetAmount > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">目標達成率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesData.achievementRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              目標: ¥{salesData.targetAmount.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}