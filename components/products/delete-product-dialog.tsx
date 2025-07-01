"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useProducts } from "@/context/products-context"

interface DeleteProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: string | null
}

export function DeleteProductDialog({ open, onOpenChange, productId }: DeleteProductDialogProps) {
  const { removeProduct } = useProducts()

  const handleDelete = () => {
    if (productId) {
      removeProduct(productId)
      onOpenChange(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>製品を削除しますか？</AlertDialogTitle>
          <AlertDialogDescription>
            この操作は元に戻せません。この製品を削除すると、関連するすべてのデータが削除されます。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
            削除
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
