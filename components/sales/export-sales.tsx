"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { useSales } from "@/context/sales-context"
import { format } from "date-fns"

interface ExportSalesProps {
  selectedMonth: Date
}

export function ExportSales({ selectedMonth }: ExportSalesProps) {
  const { sales } = useSales()

  const handleExport = () => {
    // 選択された月のデータをフィルタリング
    const filteredSales = sales.filter(
      (sale) =>
        sale.date.getFullYear() === selectedMonth.getFullYear() && sale.date.getMonth() === selectedMonth.getMonth(),
    )

    if (filteredSales.length === 0) {
      alert("エクスポートするデータがありません。")
      return
    }

    // CSVヘッダー
    const headers = ["日付", "製品名", "カテゴリ", "数量", "金額", "販売者"]

    // CSVデータの作成
    const csvData = filteredSales.map((sale) => [
      format(sale.date, "yyyy/MM/dd"),
      sale.productName,
      sale.category,
      sale.quantity.toString(),
      sale.amount.toString(),
      sale.salespersonName || "不明",
    ])

    // CSVテキストの生成
    const csvContent = [headers.join(","), ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

    // BOMを追加してUTF-8でエンコード
    const bom = new Uint8Array([0xef, 0xbb, 0xbf])
    const blob = new Blob([bom, csvContent], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)

    // ファイル名の生成（例: sales_2024_03.csv）
    const fileName = `sales_${format(selectedMonth, "yyyy_MM")}.csv`

    // ダウンロードリンクの作成とクリック
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Button variant="outline" size="icon" onClick={handleExport} title="CSVエクスポート">
      <Download className="h-4 w-4" />
      <span className="sr-only">CSVエクスポート</span>
    </Button>
  )
}
