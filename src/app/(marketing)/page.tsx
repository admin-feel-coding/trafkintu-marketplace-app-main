import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { marketplaceRepository } from "@/data/repositories/marketplace"
import { getAllPymesAction } from "@/features/pymes/actions/pymeActions"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CategoryChips } from "@/features/marketplace/components/CategoryChips"
import { FeaturedCarousel } from "@/features/marketplace/components/FeaturedCarousel"
import { ListingsGrid } from "@/features/marketplace/components/ListingsGrid"
import { getFeaturedListings, getRecentListings } from "@/features/marketplace/services/marketplaceService"
import { Footer } from "@/shared/components/Footer"
import { Navbar } from "@/shared/components/Navbar"

export default async function HomePage() {
  const [featuredListings, recentListings, categories, pymes] = await Promise.all([
    getFeaturedListings(),
    getRecentListings(8),
    marketplaceRepository.getCategories(),
    getAllPymesAction(),
  ])

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-10 md:py-16 lg:py-24">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 md:mb-6 text-balance">
              Descubre Emprendimientos Locales
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto text-pretty">
              Conecta directamente con PYMEs y emprendedores de tu comunidad. Productos únicos y servicios de calidad.
            </p>
            <Button asChild size="lg" className="text-base md:text-lg">
              <Link href="/explore">
                Explorar ahora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8 border-b">
          <div className="container mx-auto px-4">
            <CategoryChips categories={categories} />
          </div>
        </section>

        {/* Featured Listings */}
        {featuredListings.length > 0 && (
          <section className="py-8 md:py-12">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Destacados</h2>
                <Button asChild variant="ghost">
                  <Link href="/explore?featured=true">
                    Ver todos
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <FeaturedCarousel listings={featuredListings} categories={categories} pymes={pymes} />
            </div>
          </section>
        )}

        <Separator className="my-6 md:my-8" />

        {/* Recent Listings */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">Últimas Publicaciones</h2>
              <Button asChild variant="ghost">
                <Link href="/explore">
                  Ver todas
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <ListingsGrid listings={recentListings} categories={categories} pymes={pymes} />
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary/5 py-10 md:py-16 lg:py-24 mt-8 md:mt-12">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">¿Tienes un emprendimiento?</h2>
            <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8 max-w-xl mx-auto">
              Únete a TRAFKINTU y conecta con clientes de tu comunidad
            </p>
            <Button asChild size="lg" variant="default">
              <Link href="/auth">Registra tu PYME</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
