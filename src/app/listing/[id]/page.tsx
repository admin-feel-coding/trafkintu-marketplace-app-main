import Link from "next/link"
import { notFound } from "next/navigation"
import { AlertCircle, Star, Store } from "lucide-react"

import { marketplaceMockRepository } from "@/data/repositories/MarketplaceMockRepository"
import { pymeMockRepository } from "@/data/repositories/PymeMockRepository"
import { mockListings } from "@/data/mock/seed"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ContactButtons } from "@/features/marketplace/components/ContactButtons"
import { ListingGallery } from "@/features/marketplace/components/ListingGallery"
import { PymeCard } from "@/features/pymes/components/PymeCard"
import { formatPriceDisplay } from "@/lib/format"
import { Footer } from "@/shared/components/Footer"
import { Navbar } from "@/shared/components/Navbar"

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!id) {
    notFound()
  }

  const listing = (await marketplaceMockRepository.getListingById(id)) || mockListings.find((l) => l.id === id)

  if (!listing) {
    notFound()
  }

  const [pyme, categories] = await Promise.all([
    pymeMockRepository.getPymeById(listing.pymeId),
    marketplaceMockRepository.getCategories(),
  ])

  if (!pyme) {
    notFound()
  }

  const category = categories.find((c) => c.id === listing.categoryId)

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Gallery */}
            <div>
              <ListingGallery images={listing.images} title={listing.title} />
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  {listing.isFeatured && (
                    <Badge className="bg-primary text-primary-foreground">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Destacado
                    </Badge>
                  )}
                  {category && <Badge variant="secondary">{category.name}</Badge>}
                  <Badge variant="outline" className="capitalize">
                    {listing.type === "product" ? "Producto" : "Servicio"}
                  </Badge>
                </div>

                <h1 className="text-4xl font-bold mb-4 text-balance">{listing.title}</h1>
                <p className="text-3xl font-bold text-primary mb-4">{formatPriceDisplay(listing.price)}</p>
              </div>

              <Separator />

              <div>
                <h2 className="text-xl font-semibold mb-3">Descripción</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{listing.description}</p>
              </div>

              <Separator />

              <div>
                <h2 className="text-xl font-semibold mb-3">Contactar</h2>
                <ContactButtons pyme={pyme} listingTitle={listing.title} />
              </div>

              <Card className="bg-muted/50">
                <CardHeader>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1">Importante</h3>
                      <p className="text-sm text-muted-foreground">
                        TRAFKINTU conecta, el trato es directo con la pyme. Verifica detalles, precios y
                        disponibilidad antes de concretar.
                      </p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </div>

          {/* PYME Card with CTA */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Publicado por</h2>
              <Button asChild>
                <Link href={`/pyme/${pyme.id}`}>
                  <Store className="h-4 w-4 mr-2" />
                  Ver tienda completa
                </Link>
              </Button>
            </div>
            <div className="max-w-md">
              <PymeCard pyme={pyme} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
export const dynamic = "force-dynamic"
