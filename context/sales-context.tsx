"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getSupabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export type SaleItem = {
  id: string
  date: Date
  productName: string
  category: string
  quantity: number
  amount: number
  salespersonId: string | null
  salespersonName?: string
}

type SalesContextType = {
  sales: SaleItem[]
  isLoading: boolean
  addSale: (sale: Omit<SaleItem, "id">) => Promise<void>
  removeSale: (id: string) => Promise<void>
  migrateFromLocalStorage: () => Promise<void>
}

const SalesContext = createContext<SalesContextType | undefined>(undefined)

// ローカルストレージのキー
const STORAGE_KEY = "cbd-sales-data"

export function SalesProvider({ children }: { children: ReactNode }) {
  const [sales, setSales] = useState<SaleItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const supabase = getSupabase()

  // データの初期ロード
  useEffect(() => {
    const loadSales = async () => {
      try {
        setIsLoading(true)
        // LEFT JOINを使用して販売者情報がない場合でもデータを取得
        const { data, error } = await supabase
          .from("sales")
          .select(`
            *,
            salespersons(name)
          `)
          .order("date", { ascending: false })

        if (error) {
          throw error
        }

        if (data) {
          setSales(
            data.map((item) => ({
              id: item.id,
              date: new Date(item.date),
              productName: item.product_name,
              category: item.category,
              quantity: item.quantity,
              amount: item.amount,
              salespersonId: item.salesperson_id,
              salespersonName: item.salespersons?.name || "不明",
            })),
          )
        }
      } catch (error) {
        console.error("Failed to load sales:", error)
        toast({
          title: "エラー",
          description: "売上データの読み込みに失敗しました。",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadSales()
  }, [supabase, toast])

  const addSale = async (sale: Omit<SaleItem, "id">) => {
    try {
      const { data, error } = await supabase
        .from("sales")
        .insert([
          {
            date: sale.date.toISOString(),
            product_name: sale.productName,
            category: sale.category,
            quantity: sale.quantity,
            amount: sale.amount,
            salesperson_id: sale.salespersonId,
          },
        ])
        .select(`
          *,
          salespersons(name)
        `)

      if (error) {
        throw error
      }

      if (data && data[0]) {
        setSales((prev) => [
          {
            id: data[0].id,
            date: new Date(data[0].date),
            productName: data[0].product_name,
            category: data[0].category,
            quantity: data[0].quantity,
            amount: data[0].amount,
            salespersonId: data[0].salesperson_id,
            salespersonName: data[0].salespersons?.name || "不明",
          },
          ...prev,
        ])
      }
    } catch (error) {
      console.error("Failed to add sale:", error)
      toast({
        title: "エラー",
        description: "売上データの追加に失敗しました。",
        variant: "destructive",
      })
      throw error
    }
  }

  const removeSale = async (id: string) => {
    try {
      const { error } = await supabase.from("sales").delete().eq("id", id)

      if (error) {
        throw error
      }

      setSales((prev) => prev.filter((sale) => sale.id !== id))
    } catch (error) {
      console.error("Failed to remove sale:", error)
      toast({
        title: "エラー",
        description: "売上データの削除に失敗しました。",
        variant: "destructive",
      })
      throw error
    }
  }

  // ローカルストレージからSupabaseへのデータ移行
  const migrateFromLocalStorage = async () => {
    try {
      // ローカルストレージからデータを取得
      const storedData = localStorage.getItem(STORAGE_KEY)
      if (!storedData) {
        toast({
          title: "情報",
          description: "移行するローカルデータがありません。",
        })
        return
      }

      // 日付文字列をDateオブジェクトに変換
      const localSales = JSON.parse(storedData, (key, value) => {
        if (key === "date") {
          return new Date(value)
        }
        return value
      })

      if (!Array.isArray(localSales) || localSales.length === 0) {
        toast({
          title: "情報",
          description: "移行するローカルデータがありません。",
        })
        return
      }

      // デフォルトの販売者IDを取得
      const { data: defaultSalesperson } = await supabase.from("salespersons").select("id").eq("name", "店長").single()

      // Supabase形式に変換
      const salesData = localSales.map(({ id, date, productName, ...rest }) => ({
        date: date.toISOString(),
        product_name: productName,
        salesperson_id: defaultSalesperson?.id || null,
        ...rest,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

      // バッチ処理（一度に100件ずつ）
      const batchSize = 100
      let processed = 0
      let errors = 0

      for (let i = 0; i < salesData.length; i += batchSize) {
        const batch = salesData.slice(i, i + batchSize)
        const { error, count } = await supabase.from("sales").insert(batch)

        if (error) {
          console.error("Batch insert error:", error)
          errors += batch.length
        } else {
          processed += count || 0
        }
      }

      toast({
        title: "成功",
        description: `${processed}件の売上データを移行しました。${errors > 0 ? `${errors}件のエラーがありました。` : ""}`,
      })

      // データを再読み込み
      const { data, error: loadError } = await supabase
        .from("sales")
        .select(`
          *,
          salespersons(name)
        `)
        .order("date", { ascending: false })

      if (loadError) {
        throw loadError
      }

      if (data) {
        setSales(
          data.map((item) => ({
            id: item.id,
            date: new Date(item.date),
            productName: item.product_name,
            category: item.category,
            quantity: item.quantity,
            amount: item.amount,
            salespersonId: item.salesperson_id,
            salespersonName: item.salespersons?.name || "不明",
          })),
        )
      }
    } catch (error) {
      console.error("Failed to migrate sales:", error)
      toast({
        title: "エラー",
        description: "売上データの移行に失敗しました。",
        variant: "destructive",
      })
    }
  }

  return (
    <SalesContext.Provider
      value={{
        sales,
        isLoading,
        addSale,
        removeSale,
        migrateFromLocalStorage,
      }}
    >
      {children}
    </SalesContext.Provider>
  )
}

export function useSales() {
  const context = useContext(SalesContext)
  if (context === undefined) {
    throw new Error("useSales must be used within a SalesProvider")
  }
  return context
}
