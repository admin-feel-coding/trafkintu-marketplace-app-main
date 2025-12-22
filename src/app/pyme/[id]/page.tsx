import { notFound } from "next/navigation"
import { Navbar } from "@/shared/components/Navbar"
import { Footer } from "@/shared/components/Footer"
import { getPymeByIdAction, getAllPymesAction } from "@/features/pymes/actions/pymeActions"
import { getMyListingsAction } from "@/features/pymes/actions/listingActions"
import { marketplaceRepository } from "@/data/repositories/marketplace"
import { PymePublicProfile } from "@/features/pymes/components/PymePublicProfile"

export default async function PymeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!id) {
    notFound()
  }

  const pyme = await getPymeByIdAction(id)

  if (!pyme) {
    notFound()
  }

  const [listings, categories, allPymes] = await Promise.all([
    getMyListingsAction(id),
    marketplaceRepository.getCategories(),
    getAllPymesAction(),
  ])

  const activeListings = listings.filter((l) => l.isActive)

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <PymePublicProfile pyme={pyme} listings={activeListings} categories={categories} allPymes={allPymes} />
      </main>
      <Footer />
    </>
  )
}
export const dynamic = "force-dynamic"
