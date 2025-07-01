export type PeriodType = "daily" | "weekly" | "monthly" | "yearly"

export interface SalesData {
  totalAmount: number
  periodLabel: string
  comparisonLabel: string
  comparisonRate: number
  achievementRate: number
  targetAmount: number
  filteredSales: any[]
  salesCount: number
  averagePurchase: number
}

export interface ProfitAnalysis {
  totalSales: number
  totalPurchases: number
  profit: number
  profitRate: number
}

export interface SaleItem {
  id: string
  date: Date
  amount: number
  productName: string
  categoryName: string
  salespersonName?: string
}

export interface PurchaseItem {
  id: string
  date: Date
  amount: number
  productName: string
}