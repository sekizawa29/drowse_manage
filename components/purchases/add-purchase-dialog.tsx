"use client"

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
import { format, isValid, parse } from "date-fns"
import { Plus } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { usePurchases } from "@/context/purchases-context"
import { useProducts } from "@/context/products-context"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  dateInput: z.string().min(1, { message: "日付を入力してください" }),
  productName: z.string().min(1, { message: "製品名を入力してください" }),
  amount: z.coerce.number().min(1, { message: "金額は1以上である必要があります" }),
})

type FormValues = z.infer<typeof formSchema>

export function AddPurchaseDialog() {
  const [open, setOpen] = useState(false)
  const { addPurchase } = usePurchases()
  const { products } = useProducts()
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dateInput: format(new Date(), "yyyy/MM/dd"),
      productName: "",
      amount: 0,
    },
  })

  const onSubmit = (values: FormValues) => {
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

    addPurchase({
      date: dateObj,
      productName: values.productName,
      amount: values.amount,
    })

    form.reset({
      dateInput: format(new Date(), "yyyy/MM/dd"),
      productName: "",
      amount: 0,
    })

    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> 仕入れデータ追加
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>仕入れデータ追加</DialogTitle>
          <DialogDescription>新しい仕入れデータを入力してください。</DialogDescription>
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
                  <FormLabel>製品名</FormLabel>
                  <FormControl>
                    <Input list="product-suggestions" {...field} />
                  </FormControl>
                  <datalist id="product-suggestions">
                    {products.map((product) => (
                      <option key={product.id} value={product.name} />
                    ))}
                  </datalist>
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
