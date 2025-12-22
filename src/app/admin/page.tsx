"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import type { Category } from "@/domain/entities/Category"
import type { Listing } from "@/domain/entities/Listing"
import type { Pyme } from "@/domain/entities/Pyme"
import type { FeaturedRequest } from "@/domain/ports/AdminRepository"
import { marketplaceRepository } from "@/data/repositories/marketplace"
import { getAllPymesAction } from "@/features/pymes/actions/pymeActions"
import {
  getFeaturedRequestsAction,
  approveFeaturedRequestAction,
  rejectFeaturedRequestAction,
  toggleListingActiveAction,
} from "@/features/admin/actions/adminActions"
import { Toaster } from "@/components/ui/sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminStats } from "@/features/admin/components/AdminStats"
import { FeaturedRequestsTable } from "@/features/admin/components/FeaturedRequestsTable"
import { ModerationTable } from "@/features/admin/components/ModerationTable"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { Footer } from "@/shared/components/Footer"
import { Navbar } from "@/shared/components/Navbar"
import { PageHeader } from "@/shared/components/PageHeader"

export default function AdminPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()

  const [requests, setRequests] = useState<FeaturedRequest[]>([])
  const [listings, setListings] = useState<Listing[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [pymes, setPymes] = useState<Pyme[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth")
    } else if (!authLoading && user?.role !== "admin") {
      router.push("/")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const [loadedRequests, loadedListings, loadedCategories, loadedPymes] = await Promise.all([
          getFeaturedRequestsAction(),
          marketplaceRepository.getListings(),
          marketplaceRepository.getCategories(),
          getAllPymesAction(),
        ])

        setRequests(loadedRequests)
        setListings(loadedListings)
        setCategories(loadedCategories)
        setPymes(loadedPymes)
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.role === "admin") {
      loadData()
    }
  }, [user])

  const handleApproveRequest = async (requestId: string) => {
    try {
      await approveFeaturedRequestAction(requestId)

      setRequests(requests.map((r) => (r.id === requestId ? { ...r, status: "approved" as const } : r)))

      const request = requests.find((r) => r.id === requestId)
      if (request) {
        setListings(listings.map((l) => (l.id === request.listingId ? { ...l, isFeatured: true } : l)))
      }

      toast.success("Solicitud aprobada")
    } catch (error) {
      toast.error("Error al aprobar")
      console.error(error)
    }
  }

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectFeaturedRequestAction(requestId)
      setRequests(requests.map((r) => (r.id === requestId ? { ...r, status: "rejected" as const } : r)))
      toast.success("Solicitud rechazada")
    } catch (error) {
      toast.error("Error al rechazar")
      console.error(error)
    }
  }

  const handleToggleListingActive = async (listingId: string) => {
    try {
      await toggleListingActiveAction(listingId)
      setListings(listings.map((l) => (l.id === listingId ? { ...l, isActive: !l.isActive } : l)))
      toast.success("Estado actualizado")
    } catch (error) {
      toast.error("Error al actualizar")
      console.error(error)
    }
  }

  if (authLoading || isLoading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-4 md:py-8">
          <p>Cargando...</p>
        </div>
        <Footer />
      </>
    )
  }

  if (!user || user.role !== "admin") {
    return null
  }

  const stats = {
    totalListings: listings.length,
    totalPymes: pymes.length,
    featuredListings: listings.filter((l) => l.isFeatured).length,
    pendingRequests: requests.filter((r) => r.status === "pending").length,
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-4 md:py-8">
          <PageHeader title="Panel de Administración" description="Gestión de publicaciones y solicitudes destacadas" />

          <AdminStats {...stats} />

          <div className="mt-6 md:mt-8">
            <Tabs defaultValue="requests" className="w-full">
              <TabsList className="w-full sm:w-auto overflow-x-auto flex-nowrap">
                <TabsTrigger value="requests">Solicitudes Destacado</TabsTrigger>
                <TabsTrigger value="moderation">Moderación</TabsTrigger>
              </TabsList>

              <TabsContent value="requests" className="mt-4 md:mt-6">
                <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Solicitudes de Destacado</h2>
                <FeaturedRequestsTable
                  requests={requests}
                  listings={listings}
                  pymes={pymes}
                  onApprove={handleApproveRequest}
                  onReject={handleRejectRequest}
                />
              </TabsContent>

              <TabsContent value="moderation" className="mt-4 md:mt-6">
                <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Moderación de Publicaciones</h2>
                <ModerationTable
                  listings={listings}
                  categories={categories}
                  pymes={pymes}
                  onToggleActive={handleToggleListingActive}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
      <Toaster />
    </>
  )
}
