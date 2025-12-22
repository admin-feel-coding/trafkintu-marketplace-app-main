import { notFound } from "next/navigation"
import { Navbar } from "@/shared/components/Navbar"
import { Footer } from "@/shared/components/Footer"
import { pymeMockRepository } from "@/data/repositories/PymeMockRepository"
import { marketplaceMockRepository } from "@/data/repositories/MarketplaceMockRepository"
import { mockPymes } from "@/data/mock/seed"
import { PymePublicProfile } from "@/features/pymes/components/PymePublicProfile"

export default async function PymeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!id) {
    notFound()
  }

  const pyme = (await pymeMockRepository.getPymeById(id)) || mockPymes.find((p) => p.id === id)

  if (!pyme) {
    notFound()
  }

  const [listings, categories] = await Promise.all([
    pymeMockRepository.getListingsByPymeId(id),
    marketplaceMockRepository.getCategories(),
  ])

  const activeListings = listings.filter((l) => l.isActive)

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <PymePublicProfile pyme={pyme} listings={activeListings} categories={categories} allPymes={mockPymes} />
      </main>
      <Footer />
    </>
  )
}
export const dynamic = "force-dynamic"
