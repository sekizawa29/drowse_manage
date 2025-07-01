"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Upload } from "lucide-react"
import { usePurchases } from "@/context/purchases-context"
import { useToast } from "@/hooks/use-toast"
import Papa from "papaparse"
import { parse as parseDate } from "date-fns"
import { format } from "date-fns"
import { ja } from "date-fns/locale"

interface ImportPurchasesProps {
  selectedMonth: Date
  onImportComplete?: () => void
}

export function ImportPurchases({ selectedMonth, onImportComplete }: ImportPurchasesProps) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { addPurchase } = usePurchases()
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleImport = () => {
    if (!file) {
      toast({
        title: "エラー",
        description: "ファイルを選択してください。",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // CSVファイルの読み込み
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const csvText = event.target?.result as string

        // CSVのパース
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const { data, errors } = results

            if (errors.length > 0) {
              throw new Error("CSVの解析中にエラーが発生しました。")
            }

            if (data.length === 0) {
              throw new Error("インポートするデータがありません。")
            }

            // 必要なヘッダーの確認
            const requiredHeaders = ["日付", "製品名", "金額"]
            const headers = Object.keys(data[0])
            const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h))

            if (missingHeaders.length > 0) {
              throw new Error(`必要なヘッダーがありません: ${missingHeaders.join(", ")}`)
            }

            // データの追加
            let addedCount = 0
            let errorCount = 0

            data.forEach((row: any) => {
              try {
                // 日付の解析
                const dateStr = row["日付"]
                let date: Date

                try {
                  date = parseDate(dateStr, "yyyy/MM/dd", new Date())
                } catch (e) {
                  throw new Error(`無効な日付形式です: ${dateStr}`)
                }

                // 選択された月のデータのみ処理
                if (
                  date.getFullYear() === selectedMonth.getFullYear() &&
                  date.getMonth() === selectedMonth.getMonth()
                ) {
                  // 金額の解析
                  const amount = Number.parseInt(row["金額"], 10)

                  if (isNaN(amount)) {
                    throw new Error("金額が無効です。")
                  }

                  // 仕入れデータの追加
                  addPurchase({
                    date,
                    productName: row["製品名"],
                    amount,
                  })

                  addedCount++
                }
              } catch (e) {
                errorCount++
              }
            })

            // 結果の表示
            if (addedCount > 0) {
              toast({
                title: "インポート完了",
                description: `${addedCount}件のデータをインポートしました。${errorCount > 0 ? `${errorCount}件のエラーがありました。` : ""}`,
              })

              if (onImportComplete) {
                onImportComplete()
              }
            } else {
              toast({
                title: "インポート結果",
                description: "選択した月に該当するデータがありませんでした。",
                variant: "destructive",
              })
            }

            setOpen(false)
            setFile(null)
            setIsLoading(false)
          },
          error: (error) => {
            throw new Error(`CSVの解析に失敗しました: ${error.message}`)
          },
        })
      } catch (error: any) {
        toast({
          title: "インポートエラー",
          description: error.message || "ファイルの処理中にエラーが発生しました。",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    reader.onerror = () => {
      toast({
        title: "エラー",
        description: "ファイルの読み込みに失敗しました。",
        variant: "destructive",
      })
      setIsLoading(false)
    }

    reader.readAsText(file)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title="CSVインポート">
          <Upload className="h-4 w-4" />
          <span className="sr-only">CSVインポート</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>仕入れデータのインポート</DialogTitle>
          <DialogDescription>
            CSVファイルから仕入れデータをインポートします。
            <br />
            {format(selectedMonth, "yyyy年M月", { locale: ja })}のデータのみが処理されます。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="csv-file" className="text-sm font-medium">
              CSVファイル
            </label>
            <input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="cursor-pointer rounded-md border border-input px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium"
            />
            <p className="text-xs text-muted-foreground">
              ヘッダー行に「日付,製品名,金額」を含むCSVファイルを選択してください。
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            キャンセル
          </Button>
          <Button onClick={handleImport} disabled={!file || isLoading}>
            {isLoading ? "処理中..." : "インポート"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
