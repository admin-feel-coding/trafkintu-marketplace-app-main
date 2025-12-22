"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import type { Category } from "@/domain/entities/Category"
import type { Listing } from "@/domain/entities/Listing"
import { marketplaceMockRepository } from "@/data/repositories/MarketplaceMockRepository"
import { pymeMockRepository } from "@/data/repositories/PymeMockRepository"
import { Button } from "@/components/ui/button"
import { FeaturedRequestDialog } from "@/features/pymes/components/FeaturedRequestDialog"
import { DashboardStats } from "@/features/pymes/components/DashboardStats"
import { ListingFormDialog, type ListingFormData } from "@/features/pymes/components/ListingFormDialog"
import { ListingTable } from "@/features/pymes/components/ListingTable"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { createListingAction, toggleActiveAction, updateListingAction } from "@/features/pymes/actions/listingActions"
import { Footer } from "@/shared/components/Footer"
import { Navbar } from "@/shared/components/Navbar"
import { PageHeader } from "@/shared/components/PageHeader"

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  const [listings, setListings] = useState<Listing[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingListing, setEditingListing] = useState<Listing | undefined>(undefined)
  const [showFeaturedDialog, setShowFeaturedDialog] = useState(false)
  const [requestingFeaturedId, setRequestingFeaturedId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth")
    } else if (!authLoading && user?.role !== "pyme") {
      router.push("/")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    async function loadData() {
      if (!user?.pymeId) return

      setIsLoading(true)
      try {
        const [loadedListings, loadedCategories] = await Promise.all([
          pymeMockRepository.getListingsByPymeId(user.pymeId),
          marketplaceMockRepository.getCategories(),
        ])

        setListings(loadedListings)
        setCategories(loadedCategories)
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.pymeId) {
      loadData()
    }
  }, [user])

  const handleCreateListing = async (data: ListingFormData) => {
    if (!user?.pymeId) return

    try {
      const newListing = await createListingAction({
        pymeId: user.pymeId,
        title: data.title,
        type: data.type,
        categoryId: data.categoryId,
        description: data.description,
        price: {
          kind: data.priceKind,
          amount: data.priceAmount,
        },
        images: data.images,
        isActive: true,
        isFeatured: false,
      })

      setListings([...listings, newListing])
      toast.success("Publicación creada exitosamente")
    } catch (error) {
      toast.error("Error al crear la publicación")
      console.error(error)
    }
  }

  const handleUpdateListing = async (data: ListingFormData) => {
    if (!editingListing) return

    try {
      const updated = await updateListingAction(editingListing.id, {
        title: data.title,
        type: data.type,
        categoryId: data.categoryId,
        description: data.description,
        price: {
          kind: data.priceKind,
          amount: data.priceAmount,
        },
        images: data.images,
      })

      setListings(listings.map((l) => (l.id === updated.id ? updated : l)))
      setEditingListing(undefined)
      toast.success("Publicación actualizada")
    } catch (error) {
      toast.error("Error al actualizar")
      console.error(error)
    }
  }

  const handleToggleActive = async (listingId: string) => {
    try {
      const updated = await toggleActiveAction(listingId)
      setListings(listings.map((l) => (l.id === updated.id ? updated : l)))
      toast.success(updated.isActive ? "Publicación activada" : "Publicación desactivada")
    } catch (error) {
      toast.error("Error al cambiar estado")
      console.error(error)
    }
  }

  const handleRequestFeatured = async (listingId: string) => {
    setRequestingFeaturedId(listingId)
    setShowFeaturedDialog(true)
  }

  const confirmFeaturedRequest = async () => {
    if (!requestingFeaturedId) return

    try {
      await pymeMockRepository.requestFeatured(requestingFeaturedId)
      toast.success("Solicitud enviada. Te contactaremos pronto.")
      setRequestingFeaturedId(null)
    } catch (error) {
      toast.error("Error al enviar solicitud")
      console.error(error)
    }
  }

  if (authLoading || isLoading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p>Cargando...</p>
        </div>
        <Footer />
      </>
    )
  }

  if (!user || user.role !== "pyme") {
    return null
  }

  const stats = {
    totalListings: listings.length,
    activeListings: listings.filter((l) => l.isActive).length,
    featuredListings: listings.filter((l) => l.isFeatured).length,
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <PageHeader
            title="Panel de Gestión"
            description="Administra tus publicaciones"
            action={
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Publicación
              </Button>
            }
          />

          <DashboardStats {...stats} />

          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Mis Publicaciones</h2>
            <ListingTable
              listings={listings}
              categories={categories}
              onEdit={(listing) => setEditingListing(listing)}
              onToggleActive={handleToggleActive}
              onRequestFeatured={handleRequestFeatured}
            />
          </div>
        </div>
      </main>
      <Footer />

      <ListingFormDialog
        open={showCreateDialog || !!editingListing}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false)
            setEditingListing(undefined)
          }
        }}
        listing={editingListing}
        categories={categories}
        onSubmit={editingListing ? handleUpdateListing : handleCreateListing}
      />

      <FeaturedRequestDialog open={showFeaturedDialog} onOpenChange={setShowFeaturedDialog} onConfirm={confirmFeaturedRequest} />
    </>
  )
}
