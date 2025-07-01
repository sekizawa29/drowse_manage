import type { PeriodType, ProfitAnalysis, SaleItem, PurchaseItem } from "@/types/common"
import { filterDataByPeriod } from "./date-utils"

export function calculateProfitAnalysis(
  sales: SaleItem[],
  purchases: PurchaseItem[],
  selectedMonth: Date,
  period: PeriodType
): ProfitAnalysis {
  const filteredSales = filterDataByPeriod(sales, selectedMonth, period)
  const filteredPurchases = filterDataByPeriod(purchases, selectedMonth, period)

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