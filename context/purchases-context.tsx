"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getSupabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export type PurchaseItem = {
  id: string
  date: Date
  productName: string
  amount: number
}

type PurchasesContextType = {
  purchases: PurchaseItem[]
  isLoading: boolean
  addPurchase: (purchase: Omit<PurchaseItem, "id">) => Promise<void>
  removePurchase: (id: string) => Promise<void>
  migrateFromLocalStorage: () => Promise<void>
}

const PurchasesContext = createContext<PurchasesContextType | undefined>(undefined)

// ローカルストレージのキー
const STORAGE_KEY = "cbd-purchases-data"

export function PurchasesProvider({ children }: { children: ReactNode }) {
  const [purchases, setPurchases] = useState<PurchaseItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const supabase = getSupabase()

  // データの初期ロード
  useEffect(() => {
    const loadPurchases = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase.from("purchases").select("*").order("date", { ascending: false })

        if (error) {
          throw error
        }

        if (data) {
          setPurchases(
            data.map((item) => ({
              id: item.id,
              date: new Date(item.date),
              productName: item.product_name,
              amount: item.amount,
            })),
          )
        }
      } catch (error) {
        console.error("Failed to load purchases:", error)
        toast({
          title: "エラー",
          description: "仕入れデータの読み込みに失敗しました。",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadPurchases()
  }, [supabase, toast])

  const addPurchase = async (purchase: Omit<PurchaseItem, "id">) => {
    try {
      const { data, error } = await supabase
        .from("purchases")
        .insert([
          {
            date: purchase.date.toISOString(),
            product_name: purchase.productName,
            amount: purchase.amount,
          },
        ])
        .select()

      if (error) {
        throw error
      }

      if (data && data[0]) {
        setPurchases((prev) => [
          {
            id: data[0].id,
            date: new Date(data[0].date),
            productName: data[0].product_name,
            amount: data[0].amount,
          },
          ...prev,
        ])
      }
    } catch (error) {
      console.error("Failed to add purchase:", error)
      toast({
        title: "エラー",
        description: "仕入れデータの追加に失敗しました。",
        variant: "destructive",
      })
      throw error
    }
  }

  const removePurchase = async (id: string) => {
    try {
      const { error } = await supabase.from("purchases").delete().eq("id", id)

      if (error) {
        throw error
      }

      setPurchases((prev) => prev.filter((purchase) => purchase.id !== id))
    } catch (error) {
      console.error("Failed to remove purchase:", error)
      toast({
        title: "エラー",
        description: "仕入れデータの削除に失敗しました。",
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
      const localPurchases = JSON.parse(storedData, (key, value) => {
        if (key === "date") {
          return new Date(value)
        }
        return value
      })

      if (!Array.isArray(localPurchases) || localPurchases.length === 0) {
        toast({
          title: "情報",
          description: "移行するローカルデータがありません。",
        })
        return
      }

      // Supabase形式に変換
      const purchasesData = localPurchases.map(({ id, date, productName, ...rest }) => ({
        date: date.toISOString(),
        product_name: productName,
        ...rest,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

      // バッチ処理（一度に100件ずつ）
      const batchSize = 100
      let processed = 0
      let errors = 0

      for (let i = 0; i < purchasesData.length; i += batchSize) {
        const batch = purchasesData.slice(i, i + batchSize)
        const { error, count } = await supabase.from("purchases").insert(batch)

        if (error) {
          console.error("Batch insert error:", error)
          errors += batch.length
        } else {
          processed += count || 0
        }
      }

      toast({
        title: "成功",
        description: `${processed}件の仕入れデータを移行しました。${errors > 0 ? `${errors}件のエラーがありました。` : ""}`,
      })

      // データを再読み込み
      const { data, error: loadError } = await supabase
        .from("purchases")
        .select("*")
        .order("date", { ascending: false })

      if (loadError) {
        throw loadError
      }

      if (data) {
        setPurchases(
          data.map((item) => ({
            id: item.id,
            date: new Date(item.date),
            productName: item.product_name,
            amount: item.amount,
          })),
        )
      }
    } catch (error) {
      console.error("Failed to migrate purchases:", error)
      toast({
        title: "エラー",
        description: "仕入れデータの移行に失敗しました。",
        variant: "destructive",
      })
    }
  }

  return (
    <PurchasesContext.Provider
      value={{
        purchases,
        isLoading,
        addPurchase,
        removePurchase,
        migrateFromLocalStorage,
      }}
    >
      {children}
    </PurchasesContext.Provider>
  )
}

export function usePurchases() {
  const context = useContext(PurchasesContext)
  if (context === undefined) {
    throw new Error("usePurchases must be used within a PurchasesProvider")
  }
  return context
}
