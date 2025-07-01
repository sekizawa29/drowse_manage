"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { usePurchases } from "@/context/purchases-context"
import { format } from "date-fns"

interface ExportPurchasesProps {
  selectedMonth: Date
}

export function ExportPurchases({ selectedMonth }: ExportPurchasesProps) {
  const { purchases } = usePurchases()

  const handleExport = () => {
    // 選択された月のデータをフィルタリング
    const filteredPurchases = purchases.filter(
      (purchase) =>
        purchase.date.getFullYear() === selectedMonth.getFullYear() &&
        purchase.date.getMonth() === selectedMonth.getMonth(),
    )

    if (filteredPurchases.length === 0) {
      alert("エクスポートするデータがありません。")
      return
    }

    // CSVヘッダー
    const headers = ["日付", "製品名", "金額"]

    // CSVデータの作成
    const csvData = filteredPurchases.map((purchase) => [
      format(purchase.date, "yyyy/MM/dd"),
      purchase.productName,
      purchase.amount.toString(),
    ])

    // CSVテキストの生成
    const csvContent = [headers.join(","), ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

    // BOMを追加してUTF-8でエンコード
    const bom = new Uint8Array([0xef, 0xbb, 0xbf])
    const blob = new Blob([bom, csvContent], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)

    // ファイル名の生成（例: purchases_2024_03.csv）
    const fileName = `purchases_${format(selectedMonth, "yyyy_MM")}.csv`

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
