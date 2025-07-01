export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          category: string
          price: number
          stock: "in-stock" | "low-stock" | "out-of-stock"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          price: number
          stock: "in-stock" | "low-stock" | "out-of-stock"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          price?: number
          stock?: "in-stock" | "low-stock" | "out-of-stock"
          created_at?: string
          updated_at?: string
        }
      }
      sales: {
        Row: {
          id: string
          date: string
          product_name: string
          category: string
          quantity: number
          amount: number
          created_at: string
          updated_at: string
          salesperson_id: string | null
        }
        Insert: {
          id?: string
          date: string
          product_name: string
          category: string
          quantity: number
          amount: number
          created_at?: string
          updated_at?: string
          salesperson_id?: string | null
        }
        Update: {
          id?: string
          date?: string
          product_name?: string
          category?: string
          quantity?: number
          amount?: number
          created_at?: string
          updated_at?: string
          salesperson_id?: string | null
        }
      }
      purchases: {
        Row: {
          id: string
          date: string
          product_name: string
          amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date: string
          product_name: string
          amount: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date?: string
          product_name?: string
          amount?: number
          created_at?: string
          updated_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          key: string
          value: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: Json
          created_at?: string
          updated_at?: string
        }
      }
      salespersons: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
