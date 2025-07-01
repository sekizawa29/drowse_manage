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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, isValid, parse } from "date-fns"
import { Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useSales } from "@/context/sales-context"
import { useProducts } from "@/context/products-context"
import { useSalespersons } from "@/context/salespersons-context"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  dateInput: z.string().min(1, { message: "日付を入力してください" }),
  productName: z.string().min(1, { message: "製品を選択してください" }),
  salespersonId: z.string().min(1, { message: "販売者を選択してください" }),
  quantity: z.coerce.number().min(1, { message: "数量は1以上である必要があります" }),
  amount: z.coerce.number().min(1, { message: "金額は1以上である必要があります" }),
})

type FormValues = z.infer<typeof formSchema>

export function AddSaleDialog() {
  const [open, setOpen] = useState(false)
  const { addSale } = useSales()
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

  const onSubmit = async (values: FormValues) => {
    // 日付文字列を解析
    let dateObj: Date | null = null
    const currentYear = new Date().getFullYear()

    try {
      // yyyy/MM/dd または MM/dd 形式をサポート
      if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(values.dateInput)) {
        // yyyy/MM/dd 形式
        dateObj = parse(values.dateInput, "yyyy/MM/dd", new Date())
      } else if (/^\d{1,2}\/\d{1,2}$/.test(values.dateInput)) {
        // MM/dd 形式 - 現在の年を使用
        dateObj = parse(`${currentYear}/${values.dateInput}`, "yyyy/MM/dd", new Date())
      } else {
        throw new Error("日付形式が正しくありません")
      }

      // 日付が無効な場合
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

      // フォームをリセット
      form.reset({
        dateInput: format(new Date(), "yyyy/MM/dd"),
        productName: "",
        salespersonId: ownerSalesperson?.id || "",
        quantity: 1,
        amount: 0,
      })

      setOpen(false)
    } catch (error) {
      // エラーは addSale 内で処理されるため、ここでは何もしない
    }
  }

  // 製品選択時に金額を自動設定
  const handleProductChange = (value: string) => {
    const product = getProductByName(value)
    if (product) {
      const quantity = form.getValues("quantity") || 1
      form.setValue("amount", product.price * quantity)
    }
  }

  // 数量変更時に金額を自動計算
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> 売上データ追加
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
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
            <FormField
              control={form.control}
              name="productName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>製品</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value)
                      handleProductChange(value)
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="製品を選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.name}>
                          {product.name}
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
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        handleQuantityChange(e)
                      }}
                    />
                  </FormControl>
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
