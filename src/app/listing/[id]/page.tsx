import Link from "next/link"
import { notFound } from "next/navigation"
import { AlertCircle, BadgeCheck, ChevronRight, Star } from "lucide-react"

import { marketplaceRepository } from "@/data/repositories/marketplace"
import { getPymeByIdAction } from "@/features/pymes/actions/pymeActions"
import { Badge } from "@/components/ui/badge"
import { Card, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ContactButtons } from "@/features/marketplace/components/ContactButtons"
import { ListingGallery } from "@/features/marketplace/components/ListingGallery"
import { formatPriceDisplay } from "@/lib/format"
import { Footer } from "@/shared/components/Footer"
import { Navbar } from "@/shared/components/Navbar"

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!id) {
    notFound()
  }

  const listing = await marketplaceRepository.getListingById(id)

  if (!listing) {
    notFound()
  }

  const [pyme, categories] = await Promise.all([
    getPymeByIdAction(listing.pymeId),
    marketplaceRepository.getCategories(),
  ])

  if (!pyme) {
    notFound()
  }

  const category = categories.find((c) => c.id === listing.categoryId)

  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-4 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
            {/* Gallery */}
            <div>
              <ListingGallery images={listing.images} title={listing.title} />
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
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

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-balance">{listing.title}</h1>
                <p className="text-2xl md:text-3xl font-bold text-primary mb-4">{formatPriceDisplay(listing.price)}</p>

                {/* PYME link */}
                <Link href={`/pyme/${pyme.id}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                  <div className="h-8 w-8 rounded-full bg-muted overflow-hidden flex-shrink-0">
                    {pyme.avatarUrl ? (
                      <img src={pyme.avatarUrl} alt={pyme.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="h-full w-full flex items-center justify-center text-sm font-medium">{pyme.name?.charAt(0) || "P"}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium">{pyme.name || "PYME"}</span>
                  {pyme.verificationStatus === "verified" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                      <BadgeCheck className="h-3 w-3" />
                      Verificada
                    </span>
                  )}
                  <ChevronRight className="h-4 w-4" />
                </Link>
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
        </div>
      </main>
      <Footer />
    </>
  )
}
export const dynamic = "force-dynamic"
