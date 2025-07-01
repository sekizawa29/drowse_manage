import { useMemo } from "react"
import { useSales } from "@/context/sales-context"
import { useSettings } from "@/context/settings-context"
import { usePurchases } from "@/context/purchases-context"
import { calculateSalesData } from "@/lib/sales-calculator"
import { calculateProfitAnalysis } from "@/lib/profit-calculator"
import type { PeriodType } from "@/types/common"

export function useDashboardData(selectedMonth: Date, activeTab: string) {
  const { sales, isLoading: salesLoading } = useSales()
  const { salesTargets } = useSettings()
  const { purchases, isLoading: purchasesLoading } = usePurchases()

  const isLoading = salesLoading || purchasesLoading

  const salesData = useMemo(() => {
    if (!sales.length) return null
    
    const period = activeTab === "overview" ? "monthly" : (activeTab as PeriodType)
    return calculateSalesData(sales, selectedMonth, period, salesTargets)
  }, [sales, selectedMonth, activeTab, salesTargets])

  const profitData = useMemo(() => {
    if (!sales.length || !purchases.length) return null
    
    const period = activeTab === "overview" ? "monthly" : (activeTab as PeriodType)
    return calculateProfitAnalysis(sales, purchases, selectedMonth, period)
  }, [sales, purchases, selectedMonth, activeTab])

  return {
    isLoading,
    salesData,
    profitData,
    sales,
    purchases,
    salesTargets,
  }
}