"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { DataTable } from "@/components/admin/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Package, Tag, DollarSign, Archive } from "lucide-react"
import { productosApi, categoriasProductoApi } from "@/lib/productos-api"
import type { ProductoResponse, CategoriaProductoResponse, PageResponse } from "@/types/productos"
import { toast } from "sonner"
import { ProductoFormModal } from "@/components/admin/forms/producto-form-modal"
import { CategoriaFormModal } from "@/components/admin/forms/categoria-form-modal"
import { AdvancedFilters } from "@/components/admin/advanced-filters"

export default function ProductosPage() {
  // Estados para productos
  const [productos, setProductos] = useState<ProductoResponse[]>([])
  const [productosPagination, setProductosPagination] = useState<PageResponse<ProductoResponse> | null>(null)
  const [productosLoading, setProductosLoading] = useState(true)
  const [productosPage, setProductosPage] = useState(0)
  const [productosPageSize, setProductosPageSize] = useState(10)
  const [productosFilters, setProductosFilters] = useState<any>({})

  // Estados para categorías
  const [categorias, setCategorias] = useState<CategoriaProductoResponse[]>([])
  const [categoriasPagination, setCategoriasPagination] = useState<PageResponse<CategoriaProductoResponse> | null>(null)
  const [categoriasLoading, setCategoriasLoading] = useState(true)
  const [categoriasPage, setCategoriasPage] = useState(0)
  const [categoriasPageSize, setCategoriasPageSize] = useState(10)
  const [categoriasFilters, setCategoriesFilters] = useState<any>({})

  // Estados para modales
  const [productoModalOpen, setProductoModalOpen] = useState(false)
  const [categoriaModalOpen, setCategoriaModalOpen] = useState(false)
  const [selectedProducto, setSelectedProducto] = useState<ProductoResponse | null>(null)
  const [selectedCategoria, setSelectedCategoria] = useState<CategoriaProductoResponse | null>(null)

  // Estados para datos auxiliares
  const [talleres, setTalleres] = useState<any[]>([])
  const [todasCategorias, setTodasCategorias] = useState<CategoriaProductoResponse[]>([])

  useEffect(() => {
    loadAuxiliaryData()
  }, [])

  useEffect(() => {
    loadProductos(productosPage, productosPageSize, productosFilters)
  }, [productosPage, productosPageSize, productosFilters])

  useEffect(() => {
    loadCategorias(categoriasPage, categoriasPageSize, categoriasFilters)
  }, [categoriasPage, categoriasPageSize, categoriasFilters])

  const loadAuxiliaryData = async () => {
    try {
      const [talleresResponse, categoriasResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/talleres`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }).then((res) => res.json()),
        categoriasProductoApi.getAll(),
      ])
      setTalleres(talleresResponse)
      setTodasCategorias(categoriasResponse)
    } catch (error) {
      console.error("Error al cargar datos auxiliares:", error)
    }
  }

  const loadProductos = async (page = 0, size = 10, filters: any = {}) => {
    try {
      setProductosLoading(true)
      const response = await productosApi.filter({
        page,
        size,
        sort: "nombre,asc",
        ...filters,
      })
      setProductosPagination(response)
      setProductos(response.content)
    } catch (error) {
      toast.error("Error al cargar productos")
      console.error(error)
    } finally {
      setProductosLoading(false)
    }
  }

  const loadCategorias = async (page = 0, size = 10, filters: any = {}) => {
    try {
      setCategoriasLoading(true)
      const response = await categoriasProductoApi.filter({
        page,
        size,
        sort: "nombre,asc",
        ...filters,
      })
      setCategoriasPagination(response)
      setCategorias(response.content)
    } catch (error) {
      toast.error("Error al cargar categorías")
      console.error(error)
    } finally {
      setCategoriasLoading(false)
    }
  }

  // Handlers para productos
  const handleDeleteProducto = async (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      try {
        await productosApi.delete(id)
        toast.success("Producto eliminado correctamente")
        loadProductos(productosPage, productosPageSize, productosFilters)
      } catch (error) {
        toast.error("Error al eliminar producto")
        console.error(error)
      }
    }
  }

  // Handlers para categorías
  const handleDeleteCategoria = async (id: number) => {
    if (confirm("¿Estás seguro de que deseas eliminar esta categoría?")) {
      try {
        await categoriasProductoApi.delete(id)
        toast.success("Categoría eliminada correctamente")
        loadCategorias(categoriasPage, categoriasPageSize, categoriasFilters)
        loadAuxiliaryData() // Recargar categorías para los filtros
      } catch (error) {
        toast.error("Error al eliminar categoría")
        console.error(error)
      }
    }
  }

  // Configuración de filtros para productos
  const productosFilterConfig = [
    { key: "search", label: "Búsqueda General", type: "text" as const },
    { key: "minPrecio", label: "Precio Mínimo", type: "text" as const },
    { key: "maxPrecio", label: "Precio Máximo", type: "text" as const },
    { key: "minStock", label: "Stock Mínimo", type: "text" as const },
    { key: "maxStock", label: "Stock Máximo", type: "text" as const },
  ]

  const productosAdditionalData = {
    tallerId: talleres.map((taller) => ({
      value: taller.id.toString(),
      label: `${taller.nombre} - ${taller.ciudad}`,
    })),
    categoriaId: todasCategorias.map((categoria) => ({
      value: categoria.id.toString(),
      label: categoria.nombre,
    })),
  }

  // Configuración de filtros para categorías
  const categoriasFilterConfig = [{ key: "search", label: "Búsqueda General", type: "text" as const }]

  // Columnas para productos
  const productosColumns = [
    { key: "id", header: "ID" },
    { key: "nombre", header: "Nombre" },
    { key: "categoria.nombre", header: "Categoría" },
    { key: "taller.nombre", header: "Taller" },
    {
      key: "precio",
      header: "Precio",
      render: (producto: ProductoResponse) => (
        <div className="flex items-center gap-1">
          <DollarSign className="h-3 w-3" />
          {producto.precio.toFixed(2)}
        </div>
      ),
    },
    {
      key: "stock",
      header: "Stock",
      render: (producto: ProductoResponse) => (
        <div className="flex items-center gap-1">
          <Archive className="h-3 w-3" />
          <Badge variant={producto.stock > 10 ? "default" : producto.stock > 0 ? "secondary" : "destructive"}>
            {producto.stock}
          </Badge>
        </div>
      ),
    },
    {
      key: "fechaCreacion",
      header: "Fecha Creación",
      render: (producto: ProductoResponse) => new Date(producto.fechaCreacion).toLocaleDateString(),
    },
    {
      key: "descripcion",
      header: "Descripción",
      render: (producto: ProductoResponse) => (
        <span className="truncate max-w-[200px]" title={producto.descripcion}>
          {producto.descripcion}
        </span>
      ),
    },
  ]

  // Columnas para categorías
  const categoriasColumns = [
    { key: "id", header: "ID" },
    { key: "nombre", header: "Nombre" },
    { key: "descripcion", header: "Descripción" },
    {
      key: "fechaCreacion",
      header: "Fecha Creación",
      render: (categoria: CategoriaProductoResponse) => new Date(categoria.fechaCreacion).toLocaleDateString(),
    },
  ]

  // Acciones para productos
  const productosActions = (producto: ProductoResponse) => (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setSelectedProducto(producto)
          setProductoModalOpen(true)
        }}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleDeleteProducto(producto.id)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )

  // Acciones para categorías
  const categoriasActions = (categoria: CategoriaProductoResponse) => (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setSelectedCategoria(categoria)
          setCategoriaModalOpen(true)
        }}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={() => handleDeleteCategoria(categoria.id)}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestión de Productos</h2>
          <p className="text-muted-foreground">Administra el catálogo de productos y sus categorías</p>
        </div>

        <Tabs defaultValue="productos" className="space-y-4">
          <TabsList>
            <TabsTrigger value="productos" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Productos
            </TabsTrigger>
            <TabsTrigger value="categorias" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Categorías
            </TabsTrigger>
          </TabsList>

          <TabsContent value="productos" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold">Productos</h3>
                <p className="text-sm text-muted-foreground">Gestiona el inventario de productos</p>
              </div>
              <div className="flex gap-2">
                <AdvancedFilters
                  filters={[
                    ...productosFilterConfig,
                    { key: "tallerId", label: "Taller", type: "select" as const },
                    { key: "categoriaId", label: "Categoría", type: "select" as const },
                  ]}
                  onApplyFilters={(filters) => {
                    setProductosFilters(filters)
                    setProductosPage(0)
                  }}
                  onClearFilters={() => {
                    setProductosFilters({})
                    setProductosPage(0)
                  }}
                  additionalData={productosAdditionalData}
                />
                <Button
                  onClick={() => {
                    setSelectedProducto(null)
                    setProductoModalOpen(true)
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Producto
                </Button>
              </div>
            </div>

            <DataTable
              data={productos}
              columns={productosColumns}
              totalPages={productosPagination?.totalPages || 0}
              currentPage={productosPage}
              totalElements={productosPagination?.totalElements || 0}
              onPageChange={setProductosPage}
              onSearch={(search) => {
                setProductosFilters({ ...productosFilters, search })
                setProductosPage(0)
              }}
              onPageSizeChange={(size) => {
                setProductosPageSize(size)
                setProductosPage(0)
              }}
              pageSize={productosPageSize}
              isLoading={productosLoading}
              actions={productosActions}
            />
          </TabsContent>

          <TabsContent value="categorias" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold">Categorías</h3>
                <p className="text-sm text-muted-foreground">Organiza los productos por categorías</p>
              </div>
              <div className="flex gap-2">
                <AdvancedFilters
                  filters={categoriasFilterConfig}
                  onApplyFilters={(filters) => {
                    setCategoriesFilters(filters)
                    setCategoriasPage(0)
                  }}
                  onClearFilters={() => {
                    setCategoriesFilters({})
                    setCategoriasPage(0)
                  }}
                />
                <Button
                  onClick={() => {
                    setSelectedCategoria(null)
                    setCategoriaModalOpen(true)
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Categoría
                </Button>
              </div>
            </div>

            <DataTable
              data={categorias}
              columns={categoriasColumns}
              totalPages={categoriasPagination?.totalPages || 0}
              currentPage={categoriasPage}
              totalElements={categoriasPagination?.totalElements || 0}
              onPageChange={setCategoriasPage}
              onSearch={(search) => {
                setCategoriesFilters({ ...categoriasFilters, search })
                setCategoriasPage(0)
              }}
              onPageSizeChange={(size) => {
                setCategoriasPageSize(size)
                setCategoriasPage(0)
              }}
              pageSize={categoriasPageSize}
              isLoading={categoriasLoading}
              actions={categoriasActions}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modales */}
      <ProductoFormModal
        open={productoModalOpen}
        onOpenChange={setProductoModalOpen}
        producto={selectedProducto}
        onSuccess={() => {
          loadProductos(productosPage, productosPageSize, productosFilters)
          loadAuxiliaryData()
        }}
      />

      <CategoriaFormModal
        open={categoriaModalOpen}
        onOpenChange={setCategoriaModalOpen}
        categoria={selectedCategoria}
        onSuccess={() => {
          loadCategorias(categoriasPage, categoriasPageSize, categoriasFilters)
          loadAuxiliaryData()
        }}
      />
    </AdminLayout>
  )
}
