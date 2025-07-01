"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getSupabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export type SalesTargets = {
  daily: number
  weekly: number
  monthly: number
  yearly: number
}

type SettingsContextType = {
  salesTargets: SalesTargets
  isLoading: boolean
  updateSalesTargets: (targets: Partial<SalesTargets>) => Promise<void>
  migrateFromLocalStorage: () => Promise<void>
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

// ローカルストレージのキー
const STORAGE_KEY = "cbd-settings-data"

// 初期データ
const initialSalesTargets: SalesTargets = {
  daily: 30000,
  weekly: 150000,
  monthly: 700000,
  yearly: 8400000,
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [salesTargets, setSalesTargets] = useState<SalesTargets>(initialSalesTargets)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const supabase = getSupabase()

  // データの初期ロード
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase.from("settings").select("*").eq("key", "salesTargets").single()

        if (error) {
          if (error.code === "PGRST116") {
            // データが存在しない場合は初期値を保存
            await supabase.from("settings").insert([
              {
                key: "salesTargets",
                value: initialSalesTargets,
              },
            ])
            setSalesTargets(initialSalesTargets)
          } else {
            throw error
          }
        } else if (data) {
          setSalesTargets(data.value as SalesTargets)
        }
      } catch (error) {
        console.error("Failed to load settings:", error)
        toast({
          title: "エラー",
          description: "設定の読み込みに失敗しました。",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [supabase, toast])

  const updateSalesTargets = async (targets: Partial<SalesTargets>) => {
    try {
      const newTargets = { ...salesTargets, ...targets }

      const { error } = await supabase
        .from("settings")
        .update({
          value: newTargets,
          updated_at: new Date().toISOString(),
        })
        .eq("key", "salesTargets")

      if (error) {
        throw error
      }

      setSalesTargets(newTargets)

      toast({
        title: "成功",
        description: "売上目標設定が更新されました。",
      })
    } catch (error) {
      console.error("Failed to update settings:", error)
      toast({
        title: "エラー",
        description: "設定の更新に失敗しました。",
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
          description: "移行する設定データがありません。",
        })
        return
      }

      const localSettings = JSON.parse(storedData)
      if (!localSettings || !localSettings.salesTargets) {
        toast({
          title: "情報",
          description: "移行する設定データがありません。",
        })
        return
      }

      // 既存の設定を確認
      const { data, error: checkError } = await supabase.from("settings").select("*").eq("key", "salesTargets").single()

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError
      }

      if (data) {
        // 既存の設定を更新
        const { error } = await supabase
          .from("settings")
          .update({
            value: localSettings.salesTargets,
            updated_at: new Date().toISOString(),
          })
          .eq("key", "salesTargets")

        if (error) {
          throw error
        }
      } else {
        // 新しい設定を挿入
        const { error } = await supabase.from("settings").insert([
          {
            key: "salesTargets",
            value: localSettings.salesTargets,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])

        if (error) {
          throw error
        }
      }

      setSalesTargets(localSettings.salesTargets)

      toast({
        title: "成功",
        description: "設定データを移行しました。",
      })
    } catch (error) {
      console.error("Failed to migrate settings:", error)
      toast({
        title: "エラー",
        description: "設定データの移行に失敗しました。",
        variant: "destructive",
      })
    }
  }

  return (
    <SettingsContext.Provider
      value={{
        salesTargets,
        isLoading,
        updateSalesTargets,
        migrateFromLocalStorage,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
