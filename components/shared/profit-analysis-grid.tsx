import type { ProfitAnalysis } from "@/types/common"

interface ProfitAnalysisGridProps {
  data: ProfitAnalysis
}

export function ProfitAnalysisGrid({ data }: ProfitAnalysisGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-muted/30 p-4 rounded-lg">
        <h3 className="text-sm font-medium mb-2">売上合計</h3>
        <p className="text-2xl font-bold">¥{data.totalSales.toLocaleString()}</p>
      </div>
      <div className="bg-muted/30 p-4 rounded-lg">
        <h3 className="text-sm font-medium mb-2">仕入れ合計</h3>
        <p className="text-2xl font-bold">¥{data.totalPurchases.toLocaleString()}</p>
      </div>
      <div
        className={`p-4 rounded-lg ${
          data.profit >= 0 
            ? "bg-green-100 dark:bg-green-900/30" 
            : "bg-red-100 dark:bg-red-900/30"
        }`}
      >
        <h3 className="text-sm font-medium mb-2">利益</h3>
        <p className="text-2xl font-bold">¥{data.profit.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">
          利益率: {data.profitRate.toFixed(1)}%
        </p>
      </div>
    </div>
  )
}