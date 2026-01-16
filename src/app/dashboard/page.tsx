"use client"

import { useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import type { Category } from "@/domain/entities/Category"
import type { Listing } from "@/domain/entities/Listing"
import { marketplaceRepository } from "@/data/repositories/marketplace"
import { Button } from "@/components/ui/button"
import { FeaturedRequestDialog } from "@/features/pymes/components/FeaturedRequestDialog"
import { DashboardStats } from "@/features/pymes/components/DashboardStats"
import { ListingFormDialog, type ListingFormData } from "@/features/pymes/components/ListingFormDialog"
import { ListingTable } from "@/features/pymes/components/ListingTable"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { createListingAction, getMyListingsAction, toggleActiveAction, updateListingAction } from "@/features/pymes/actions/listingActions"
import { Footer } from "@/shared/components/Footer"
import { Navbar } from "@/shared/components/Navbar"
import { PageHeader } from "@/shared/components/PageHeader"
import type { FeaturedPlan } from "@/domain/entities/FeaturedPlan"
import { supabaseBrowser } from "@/shared/lib/supabase/browser"

type FeaturedPlanRow = {
  id: string
  name: string
  days: number
  price_clp: number | string
  is_active: boolean
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth()

  const [listings, setListings] = useState<Listing[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingListing, setEditingListing] = useState<Listing | undefined>(undefined)
  const [showFeaturedDialog, setShowFeaturedDialog] = useState(false)
  const [requestingFeaturedId, setRequestingFeaturedId] = useState<string | null>(null)
  const [featuredPlans, setFeaturedPlans] = useState<FeaturedPlan[]>([])
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [isCreatingPayment, setIsCreatingPayment] = useState(false)

  // Auth is handled by middleware - no redirect needed here

  useEffect(() => {
    async function loadData() {
      if (!user?.pymeId) return

      setIsLoading(true)
      try {
        const [loadedListings, loadedCategories] = await Promise.all([
          getMyListingsAction(user.pymeId),
          marketplaceRepository.getCategories(),
        ])

        setListings(loadedListings)
        setCategories(loadedCategories)

        const supabase = supabaseBrowser()
        if (supabase) {
          const { data: plans } = await supabase
            .from("featured_plans")
            .select("*")
            .eq("is_active", true)
            .order("days", { ascending: true })

          if (plans) {
            const mappedPlans = (plans as FeaturedPlanRow[]).map((plan) => ({
              id: plan.id,
              name: plan.name,
              days: plan.days,
              priceClp: Number(plan.price_clp),
              isActive: plan.is_active,
            }))
            setFeaturedPlans(mappedPlans)
            if (!selectedPlanId && mappedPlans.length > 0) {
              setSelectedPlanId(mappedPlans[0].id)
            }
          }
        }
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
    if (!selectedPlanId && featuredPlans.length > 0) {
      setSelectedPlanId(featuredPlans[0].id)
    }
    setShowFeaturedDialog(true)
  }

  const confirmFeaturedRequest = async () => {
    if (!requestingFeaturedId || !selectedPlanId) return

    const supabase = supabaseBrowser()
    if (!supabase) {
      toast.error("Supabase no configurado")
      return
    }

    setIsCreatingPayment(true)
    try {
      const { data, error } = await supabase.functions.invoke("create-featured-payment", {
        body: {
          listingId: requestingFeaturedId,
          planId: selectedPlanId,
          returnBaseUrl: window.location.origin,
        },
      })

      if (error || !data?.initPoint) {
        throw new Error(error?.message || "Error creando pago")
      }

      setRequestingFeaturedId(null)
      window.location.href = data.initPoint
    } catch (error) {
      toast.error("Error al crear el pago")
      console.error(error)
    } finally {
      setIsCreatingPayment(false)
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

  // Middleware ensures only pyme users reach this page
  if (!user) {
    return null // Still loading
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
        <div className="container mx-auto px-4 py-4 md:py-8">
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

          <div className="mt-6 md:mt-8">
            <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Mis Publicaciones</h2>
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
        userId={user.id}
        onSubmit={editingListing ? handleUpdateListing : handleCreateListing}
      />

      <FeaturedRequestDialog
        open={showFeaturedDialog}
        onOpenChange={setShowFeaturedDialog}
        onConfirm={confirmFeaturedRequest}
        plans={featuredPlans}
        selectedPlanId={selectedPlanId}
        onSelectPlan={setSelectedPlanId}
        isSubmitting={isCreatingPayment}
      />
    </>
  )
}
