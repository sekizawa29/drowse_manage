import { format } from "date-fns"
import { ja } from "date-fns/locale"
import type { PeriodType, SalesData, SaleItem } from "@/types/common"
import { filterDataByPeriod, getPeriodLabel, getComparisonLabel } from "./date-utils"

export function calculateSalesData(
  sales: SaleItem[],
  selectedMonth: Date,
  period: PeriodType,
  salesTargets: { daily: number; weekly: number; monthly: number; yearly: number }
): SalesData {
  const filteredSales = filterDataByPeriod(sales, selectedMonth, period)
  
  const totalAmount = filteredSales.reduce((sum, sale) => sum + sale.amount, 0)
  const salesCount = filteredSales.length
  const averagePurchase = salesCount > 0 ? totalAmount / salesCount : 0
  
  const periodLabel = period === "overview" 
    ? format(selectedMonth, "yyyy年M月", { locale: ja }) + "の売上"
    : getPeriodLabel(period as PeriodType)
  
  const comparisonLabel = period === "overview" 
    ? "前月比"
    : getComparisonLabel(period as PeriodType)

  let targetAmount = 0
  switch (period) {
    case "daily":
      targetAmount = salesTargets.daily
      break
    case "weekly":
      targetAmount = salesTargets.weekly
      break
    case "monthly":
      targetAmount = salesTargets.monthly
      break
    case "yearly":
      targetAmount = salesTargets.yearly
      break
    default:
      targetAmount = salesTargets.monthly
  }

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
    salesCount,
    averagePurchase,
  }
}