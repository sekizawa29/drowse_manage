"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getSupabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

export type Product = {
  id: string
  name: string
  category: string
  price: number
  stock: "in-stock" | "low-stock" | "out-of-stock"
}

type ProductsContextType = {
  products: Product[]
  isLoading: boolean
  addProduct: (product: Omit<Product, "id">) => Promise<void>
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>
  removeProduct: (id: string) => Promise<void>
  getProductByName: (name: string) => Product | undefined
  migrateFromLocalStorage: () => Promise<void>
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined)

// ローカルストレージのキー
const STORAGE_KEY = "cbd-products-data"

// 初期データ（ローカルストレージにデータがない場合のみ使用）
const initialProducts: Product[] = [
  {
    id: "1",
    name: "CBDオイル 30ml (1000mg)",
    category: "CBD",
    price: 8500,
    stock: "in-stock",
  },
  {
    id: "2",
    name: "CBDオイル 15ml (500mg)",
    category: "CBD",
    price: 4800,
    stock: "in-stock",
  },
  {
    id: "3",
    name: "CBDグミ 30個入り",
    category: "CBD",
    price: 5200,
    stock: "in-stock",
  },
  {
    id: "4",
    name: "CBDクリーム 50g",
    category: "CBD",
    price: 6800,
    stock: "in-stock",
  },
  {
    id: "5",
    name: "CBNカプセル 60個入り",
    category: "CBN",
    price: 7200,
    stock: "low-stock",
  },
  {
    id: "6",
    name: "CBGバスボム 4個セット",
    category: "CBG",
    price: 3600,
    stock: "in-stock",
  },
]

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const supabase = getSupabase()

  // データの初期ロード
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase.from("products").select("*").order("name", { ascending: true })

        if (error) {
          throw error
        }

        if (data) {
          setProducts(
            data.map((item) => ({
              id: item.id,
              name: item.name,
              category: item.category,
              price: item.price,
              stock: item.stock as "in-stock" | "low-stock" | "out-of-stock",
            })),
          )
        }
      } catch (error) {
        console.error("Failed to load products:", error)
        toast({
          title: "エラー",
          description: "製品データの読み込みに失敗しました。",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [supabase, toast])

  const addProduct = async (product: Omit<Product, "id">) => {
    try {
      const { data, error } = await supabase.from("products").insert([product]).select()

      if (error) {
        throw error
      }

      if (data && data[0]) {
        setProducts((prev) => [
          ...prev,
          {
            id: data[0].id,
            name: data[0].name,
            category: data[0].category,
            price: data[0].price,
            stock: data[0].stock as "in-stock" | "low-stock" | "out-of-stock",
          },
        ])
      }
    } catch (error) {
      console.error("Failed to add product:", error)
      toast({
        title: "エラー",
        description: "製品の追加に失敗しました。",
        variant: "destructive",
      })
      throw error
    }
  }

  const updateProduct = async (id: string, product: Partial<Product>) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({
          ...product,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) {
        throw error
      }

      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...product } : p)))
    } catch (error) {
      console.error("Failed to update product:", error)
      toast({
        title: "エラー",
        description: "製品の更新に失敗しました。",
        variant: "destructive",
      })
      throw error
    }
  }

  const removeProduct = async (id: string) => {
    try {
      const { error } = await supabase.from("products").delete().eq("id", id)

      if (error) {
        throw error
      }

      setProducts((prev) => prev.filter((product) => product.id !== id))
    } catch (error) {
      console.error("Failed to remove product:", error)
      toast({
        title: "エラー",
        description: "製品の削除に失敗しました。",
        variant: "destructive",
      })
      throw error
    }
  }

  const getProductByName = (name: string) => {
    return products.find((product) => product.name === name)
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

      const localProducts = JSON.parse(storedData)
      if (!Array.isArray(localProducts) || localProducts.length === 0) {
        toast({
          title: "情報",
          description: "移行するローカルデータがありません。",
        })
        return
      }

      // 既存のデータを確認
      const { data: existingData } = await supabase.from("products").select("name")

      const existingNames = new Set(existingData?.map((item) => item.name) || [])

      // 新しいデータのみを挿入
      const newProducts = localProducts
        .filter((product) => !existingNames.has(product.name))
        .map(({ id, ...rest }) => ({
          ...rest,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }))

      if (newProducts.length === 0) {
        toast({
          title: "情報",
          description: "すべてのローカルデータは既にデータベースに存在します。",
        })
        return
      }

      const { error } = await supabase.from("products").insert(newProducts)

      if (error) {
        throw error
      }

      toast({
        title: "成功",
        description: `${newProducts.length}件の製品データを移行しました。`,
      })

      // データを再読み込み
      const { data, error: loadError } = await supabase.from("products").select("*").order("name", { ascending: true })

      if (loadError) {
        throw loadError
      }

      if (data) {
        setProducts(
          data.map((item) => ({
            id: item.id,
            name: item.name,
            category: item.category,
            price: item.price,
            stock: item.stock as "in-stock" | "low-stock" | "out-of-stock",
          })),
        )
      }
    } catch (error) {
      console.error("Failed to migrate products:", error)
      toast({
        title: "エラー",
        description: "製品データの移行に失敗しました。",
        variant: "destructive",
      })
    }
  }

  return (
    <ProductsContext.Provider
      value={{
        products,
        isLoading,
        addProduct,
        updateProduct,
        removeProduct,
        getProductByName,
        migrateFromLocalStorage,
      }}
    >
      {children}
    </ProductsContext.Provider>
  )
}

export function useProducts() {
  const context = useContext(ProductsContext)
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductsProvider")
  }
  return context
}
