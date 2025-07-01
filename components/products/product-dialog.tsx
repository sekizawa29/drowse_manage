"use client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useProducts, type Product } from "@/context/products-context"

const formSchema = z.object({
  name: z.string().min(1, { message: "製品名を入力してください" }),
  category: z.string().min(1, { message: "カテゴリを選択してください" }),
  price: z.coerce.number().min(1, { message: "価格は1以上である必要があります" }),
  stock: z.enum(["in-stock", "low-stock", "out-of-stock"]),
})

type FormValues = z.infer<typeof formSchema>

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: Product
  mode: "add" | "edit"
}

// カテゴリを指定のものに変更
const CATEGORIES = ["CBD", "CBN", "CBG", "その他"]
const STOCK_OPTIONS = [
  { value: "in-stock", label: "在庫あり" },
  { value: "low-stock", label: "残りわずか" },
  { value: "out-of-stock", label: "在庫なし" },
]

export function ProductDialog({ open, onOpenChange, product, mode }: ProductDialogProps) {
  const { addProduct, updateProduct } = useProducts()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: product
      ? {
          name: product.name,
          category: product.category,
          price: product.price,
          stock: product.stock,
        }
      : {
          name: "",
          category: "",
          price: 0,
          stock: "in-stock",
        },
  })

  const onSubmit = (values: FormValues) => {
    if (mode === "add") {
      addProduct(values)
    } else if (mode === "edit" && product) {
      updateProduct(product.id, values)
    }

    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "製品追加" : "製品編集"}</DialogTitle>
          <DialogDescription>
            {mode === "add" ? "新しい製品情報を入力してください。" : "製品情報を編集してください。"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>製品名</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>カテゴリ</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="カテゴリを選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
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
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>価格 (円)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>在庫状況</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="在庫状況を選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STOCK_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">{mode === "add" ? "追加" : "更新"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
