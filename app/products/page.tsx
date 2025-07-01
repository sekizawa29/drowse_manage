"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Pencil, Trash2 } from "lucide-react"
import { useProducts, type Product } from "@/context/products-context"
import { ProductDialog } from "@/components/products/product-dialog"
import { DeleteProductDialog } from "@/components/products/delete-product-dialog"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ProductsPage() {
  const { products, isLoading } = useProducts()
  const [searchQuery, setSearchQuery] = useState("")
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // 検索フィルタリング
  const filteredProducts = products.filter((product) => {
    return (
      !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product)
    setEditDialogOpen(true)
  }

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product)
    setDeleteDialogOpen(true)
  }

  // 在庫状況に応じたバッジのスタイルを返す関数
  const getStockBadgeStyle = (stock: string) => {
    switch (stock) {
      case "in-stock":
        return "bg-green-500"
      case "low-stock":
        return "bg-yellow-500 text-white"
      case "out-of-stock":
        return "bg-red-500 text-white"
      default:
        return ""
    }
  }

  // 在庫状況の表示テキストを返す関数
  const getStockLabel = (stock: string) => {
    switch (stock) {
      case "in-stock":
        return "在庫あり"
      case "low-stock":
        return "残りわずか"
      case "out-of-stock":
        return "在庫なし"
      default:
        return ""
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">製品管理</h2>
          <p className="text-muted-foreground">CBD製品の情報を管理します。</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> 製品追加
        </Button>
      </div>
      <div className="flex items-center space-x-2">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="製品名、カテゴリで検索..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        {isLoading ? (
          <LoadingSpinner text="製品データを読み込み中..." />
        ) : (
          <>
            {/* デスクトップ表示 */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>製品名</TableHead>
                    <TableHead>カテゴリ</TableHead>
                    <TableHead>価格</TableHead>
                    <TableHead>在庫状況</TableHead>
                    <TableHead className="text-right">アクション</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                        <TableCell>¥{product.price.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge className={getStockBadgeStyle(product.stock)}>{getStockLabel(product.stock)}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEditClick(product)}>
                              <Pencil className="h-4 w-4 mr-1" /> 編集
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => handleDeleteClick(product)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> 削除
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        該当するデータがありません
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* モバイル表示 */}
            <div className="md:hidden">
              <div className="divide-y">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <div key={product.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <Badge variant="outline" className="mt-1">
                            {product.category}
                          </Badge>
                        </div>
                        <Badge className={getStockBadgeStyle(product.stock)}>{getStockLabel(product.stock)}</Badge>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="font-bold">¥{product.price.toLocaleString()}</div>
                      </div>
                      <div className="mt-3 flex justify-end space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditClick(product)}>
                          <Pencil className="h-4 w-4 mr-2" /> 編集
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleDeleteClick(product)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> 削除
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-muted-foreground">該当するデータがありません</div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 製品追加ダイアログ */}
      <ProductDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} mode="add" />

      {/* 製品編集ダイアログ */}
      {selectedProduct && (
        <ProductDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} product={selectedProduct} mode="edit" />
      )}

      {/* 製品削除確認ダイアログ */}
      <DeleteProductDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        productId={selectedProduct?.id || null}
      />
    </div>
  )
}
