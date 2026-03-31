"use client"

import type React from "react"

import { useState, useMemo, useCallback, useEffect } from "react"
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, isValid, parse } from "date-fns"
import { Plus, Minus, Check, Flame } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useSales } from "@/context/sales-context"
import { useProducts } from "@/context/products-context"
import { useSalespersons } from "@/context/salespersons-context"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  dateInput: z.string().min(1, { message: "日付を入力してください" }),
  productName: z.string().min(1, { message: "製品を選択してください" }),
  salespersonId: z.string().min(1, { message: "販売者を選択してください" }),
  quantity: z.coerce.number().min(1, { message: "数量は1以上である必要があります" }),
  amount: z.coerce.number().min(1, { message: "金額は1以上である必要があります" }),
})

type FormValues = z.infer<typeof formSchema>

/** Category accent colors for product tiles */
const categoryAccent: Record<string, { stripe: string; bg: string; badge: string }> = {
  CBD: {
    stripe: "bg-emerald-500 dark:bg-emerald-400",
    bg: "bg-emerald-50/60 dark:bg-emerald-950/20",
    badge: "text-emerald-700 dark:text-emerald-400",
  },
  CBN: {
    stripe: "bg-violet-500 dark:bg-violet-400",
    bg: "bg-violet-50/60 dark:bg-violet-950/20",
    badge: "text-violet-700 dark:text-violet-400",
  },
  CBG: {
    stripe: "bg-amber-500 dark:bg-amber-400",
    bg: "bg-amber-50/60 dark:bg-amber-950/20",
    badge: "text-amber-700 dark:text-amber-400",
  },
}
const defaultAccent = {
  stripe: "bg-gray-400 dark:bg-gray-500",
  bg: "bg-muted/40",
  badge: "text-muted-foreground",
}

export function AddSaleDialog() {
  const [open, setOpen] = useState(false)
  const { sales, addSale } = useSales()
  const { products, getProductByName } = useProducts()
  const { getActiveSalespersons, getOwnerSalesperson } = useSalespersons()
  const { toast } = useToast()

  const activeSalespersons = getActiveSalespersons()
  const ownerSalesperson = getOwnerSalesperson()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dateInput: format(new Date(), "yyyy/MM/dd"),
      productName: "",
      salespersonId: ownerSalesperson?.id || "",
      quantity: 1,
      amount: 0,
    },
  })

  // Products sorted by sales frequency
  const sortedProducts = useMemo(() => {
    const counts = new Map<string, number>()
    for (const sale of sales) {
      counts.set(sale.productName, (counts.get(sale.productName) || 0) + 1)
    }
    return [...products].sort(
      (a, b) => (counts.get(b.name) || 0) - (counts.get(a.name) || 0),
    )
  }, [products, sales])

  // Most-sold product name for hot badge
  const topProductName = useMemo(() => {
    if (sortedProducts.length === 0) return null
    const counts = new Map<string, number>()
    for (const sale of sales) {
      counts.set(sale.productName, (counts.get(sale.productName) || 0) + 1)
    }
    const topCount = counts.get(sortedProducts[0]?.name) || 0
    return topCount > 0 ? sortedProducts[0].name : null
  }, [sortedProducts, sales])

  const onSubmit = async (values: FormValues) => {
    let dateObj: Date | null = null
    const currentYear = new Date().getFullYear()

    try {
      if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(values.dateInput)) {
        dateObj = parse(values.dateInput, "yyyy/MM/dd", new Date())
      } else if (/^\d{1,2}\/\d{1,2}$/.test(values.dateInput)) {
        dateObj = parse(`${currentYear}/${values.dateInput}`, "yyyy/MM/dd", new Date())
      } else {
        throw new Error("日付形式が正しくありません")
      }

      if (!isValid(dateObj)) {
        throw new Error("無効な日付です")
      }
    } catch (error) {
      toast({
        title: "無効な日付形式",
        description: "日付は yyyy/MM/dd または MM/dd 形式で入力してください",
        variant: "destructive",
      })
      return
    }

    const product = getProductByName(values.productName)

    try {
      await addSale({
        date: dateObj,
        productName: values.productName,
        category: product?.category || "",
        quantity: values.quantity,
        amount: values.amount,
        salespersonId: values.salespersonId,
      })

      toast({
        title: "成功",
        description: "売上データを追加しました。",
      })

      form.reset({
        dateInput: format(new Date(), "yyyy/MM/dd"),
        productName: "",
        salespersonId: ownerSalesperson?.id || "",
        quantity: 1,
        amount: 0,
      })

      setOpen(false)
    } catch (error) {
      // エラーは addSale 内で処理される
    }
  }

  // 製品タイル選択時
  const handleProductSelect = useCallback(
    (productName: string) => {
      form.setValue("productName", productName, { shouldValidate: true })
      const product = getProductByName(productName)
      if (product) {
        const quantity = form.getValues("quantity") || 1
        form.setValue("amount", product.price * quantity)
      }
    },
    [form, getProductByName],
  )

  // ステッパーからの数量変更時に金額を自動計算
  const updateAmountForQuantity = (quantity: number) => {
    const productName = form.getValues("productName")
    if (productName) {
      const product = getProductByName(productName)
      if (product) {
        form.setValue("amount", product.price * quantity)
      }
    }
  }

  // input直接変更時に金額を自動計算
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const quantity = Number.parseInt(e.target.value) || 0
    const productName = form.getValues("productName")

    if (productName) {
      const product = getProductByName(productName)
      if (product) {
        form.setValue("amount", product.price * quantity)
      }
    }
  }

  const selectedProductName = form.watch("productName")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> 売上データ追加
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>売上データ追加</DialogTitle>
          <DialogDescription>新しい売上データを入力してください。</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="dateInput"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>日付 (yyyy/MM/dd または MM/dd)</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="例: 2024/03/21 または 03/21" />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    年を省略すると現在の年（{new Date().getFullYear()}年）が使用されます
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ── Product tile grid (replaces Select dropdown) ── */}
            <FormField
              control={form.control}
              name="productName"
              render={() => (
                <FormItem>
                  <FormLabel>製品</FormLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {sortedProducts.map((product) => {
                      const accent = categoryAccent[product.category] || defaultAccent
                      const isSelected = selectedProductName === product.name
                      const isTop = product.name === topProductName

                      return (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => handleProductSelect(product.name)}
                          className={cn(
                            "relative flex flex-col items-start rounded-xl p-2.5 text-left",
                            "transition-all duration-100 ease-out",
                            "active:scale-[0.97] active:shadow-none",
                            accent.bg,
                            isSelected
                              ? "ring-2 ring-primary/40 shadow-md shadow-primary/10"
                              : "shadow-sm hover:shadow-md",
                          )}
                        >
                          <span className="flex items-center gap-1 mb-0.5">
                            <span
                              className={cn(
                                "text-[9px] font-bold uppercase tracking-widest",
                                accent.badge,
                              )}
                            >
                              {product.category}
                            </span>
                            {isTop && (
                              <Flame className="h-2.5 w-2.5 text-orange-500 dark:text-orange-400" />
                            )}
                          </span>
                          <span className="text-xs font-semibold leading-snug text-foreground line-clamp-2 min-h-[2.25em]">
                            {product.name}
                          </span>
                          <span className="mt-auto pt-1 text-[10px] tabular-nums font-medium text-muted-foreground">
                            ¥{product.price.toLocaleString()}
                          </span>
                          {isSelected && (
                            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
                              <Check className="h-2.5 w-2.5 text-primary-foreground" />
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salespersonId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>販売者</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="販売者を選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {activeSalespersons.map((salesperson) => (
                        <SelectItem key={salesperson.id} value={salesperson.id}>
                          {salesperson.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>数量</FormLabel>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full shrink-0"
                      disabled={field.value <= 1}
                      onClick={() => {
                        const next = Math.max(1, field.value - 1)
                        field.onChange(next)
                        updateAmountForQuantity(next)
                      }}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        className="text-center text-lg font-bold tabular-nums"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e)
                          handleQuantityChange(e)
                        }}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-10 w-10 rounded-full shrink-0"
                      onClick={() => {
                        const next = field.value + 1
                        field.onChange(next)
                        updateAmountForQuantity(next)
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>金額 (円)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">追加</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
