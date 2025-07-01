"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getSupabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export type Salesperson = {
  id: string
  name: string
  email: string | null
  phone: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

type SalespersonsContextType = {
  salespersons: Salesperson[]
  isLoading: boolean
  addSalesperson: (salesperson: Omit<Salesperson, "id" | "createdAt" | "updatedAt">) => Promise<void>
  updateSalesperson: (
    id: string,
    salesperson: Partial<Omit<Salesperson, "id" | "createdAt" | "updatedAt">>,
  ) => Promise<void>
  removeSalesperson: (id: string) => Promise<void>
  getActiveSalespersons: () => Salesperson[]
  getSalespersonById: (id: string) => Salesperson | undefined
  getOwnerSalesperson: () => Salesperson | undefined
}

const SalespersonsContext = createContext<SalespersonsContextType | undefined>(undefined)

export function SalespersonsProvider({ children }: { children: ReactNode }) {
  const [salespersons, setSalespersons] = useState<Salesperson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const supabase = getSupabase()

  // データの初期ロード
  useEffect(() => {
    const loadSalespersons = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from("salespersons")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) {
          throw error
        }

        if (data) {
          setSalespersons(
            data.map((item) => ({
              id: item.id,
              name: item.name,
              email: item.email,
              phone: item.phone,
              isActive: item.is_active,
              createdAt: new Date(item.created_at),
              updatedAt: new Date(item.updated_at),
            })),
          )
        }
      } catch (error) {
        console.error("Failed to load salespersons:", error)
        toast({
          title: "エラー",
          description: "販売者データの読み込みに失敗しました。",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadSalespersons()
  }, [supabase, toast])

  const addSalesperson = async (salesperson: Omit<Salesperson, "id" | "createdAt" | "updatedAt">) => {
    try {
      const { data, error } = await supabase
        .from("salespersons")
        .insert([
          {
            name: salesperson.name,
            email: salesperson.email,
            phone: salesperson.phone,
            is_active: salesperson.isActive,
          },
        ])
        .select()

      if (error) {
        throw error
      }

      if (data && data[0]) {
        setSalespersons((prev) => [
          {
            id: data[0].id,
            name: data[0].name,
            email: data[0].email,
            phone: data[0].phone,
            isActive: data[0].is_active,
            createdAt: new Date(data[0].created_at),
            updatedAt: new Date(data[0].updated_at),
          },
          ...prev,
        ])
      }
    } catch (error) {
      console.error("Failed to add salesperson:", error)
      toast({
        title: "エラー",
        description: "販売者の追加に失敗しました。",
        variant: "destructive",
      })
      throw error
    }
  }

  const updateSalesperson = async (
    id: string,
    salesperson: Partial<Omit<Salesperson, "id" | "createdAt" | "updatedAt">>,
  ) => {
    try {
      const updateData: any = {}
      if (salesperson.name !== undefined) updateData.name = salesperson.name
      if (salesperson.email !== undefined) updateData.email = salesperson.email
      if (salesperson.phone !== undefined) updateData.phone = salesperson.phone
      if (salesperson.isActive !== undefined) updateData.is_active = salesperson.isActive

      const { data, error } = await supabase.from("salespersons").update(updateData).eq("id", id).select()

      if (error) {
        throw error
      }

      if (data && data[0]) {
        setSalespersons((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  id: data[0].id,
                  name: data[0].name,
                  email: data[0].email,
                  phone: data[0].phone,
                  isActive: data[0].is_active,
                  createdAt: new Date(data[0].created_at),
                  updatedAt: new Date(data[0].updated_at),
                }
              : item,
          ),
        )
      }
    } catch (error) {
      console.error("Failed to update salesperson:", error)
      toast({
        title: "エラー",
        description: "販売者の更新に失敗しました。",
        variant: "destructive",
      })
      throw error
    }
  }

  const removeSalesperson = async (id: string) => {
    try {
      // 論理削除（is_active = false）
      const { error } = await supabase.from("salespersons").update({ is_active: false }).eq("id", id)

      if (error) {
        throw error
      }

      setSalespersons((prev) => prev.map((item) => (item.id === id ? { ...item, isActive: false } : item)))
    } catch (error) {
      console.error("Failed to remove salesperson:", error)
      toast({
        title: "エラー",
        description: "販売者の削除に失敗しました。",
        variant: "destructive",
      })
      throw error
    }
  }

  const getActiveSalespersons = () => {
    return salespersons.filter((salesperson) => salesperson.isActive)
  }

  const getSalespersonById = (id: string) => {
    return salespersons.find((salesperson) => salesperson.id === id)
  }

  const getOwnerSalesperson = () => {
    return salespersons.find((salesperson) => salesperson.name === "オーナー" && salesperson.isActive)
  }

  return (
    <SalespersonsContext.Provider
      value={{
        salespersons,
        isLoading,
        addSalesperson,
        updateSalesperson,
        removeSalesperson,
        getActiveSalespersons,
        getSalespersonById,
        getOwnerSalesperson,
      }}
    >
      {children}
    </SalespersonsContext.Provider>
  )
}

export function useSalespersons() {
  const context = useContext(SalespersonsContext)
  if (context === undefined) {
    throw new Error("useSalespersons must be used within a SalespersonsProvider")
  }
  return context
}
