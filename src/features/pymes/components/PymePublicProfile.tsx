"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import { Clock, Globe, Mail, MapPin, Phone, Search, Truck } from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import type { Category } from "@/domain/entities/Category"
import type { Listing } from "@/domain/entities/Listing"
import type { Pyme } from "@/domain/entities/Pyme"
import { ListingCard } from "@/features/marketplace/components/ListingCard"

interface PymePublicProfileProps {
  pyme: Pyme
  listings: Listing[]
  categories: Category[]
  allPymes: Pyme[]
}

export function PymePublicProfile({ pyme, listings, categories, allPymes }: PymePublicProfileProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "product" | "service">("all")
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" })
  const [sending, setSending] = useState(false)

  const fulfillmentLabels: Record<Pyme["fulfillment"], string> = {
    local: "Retiro local",
    delivery: "Despacho a domicilio",
    both: "Retiro y despacho",
  }

  const filteredListings = listings.filter((listing) => {
    const matchesType = typeFilter === "all" || listing.type === typeFilter
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast.success("Mensaje enviado correctamente")
    setContactForm({ name: "", email: "", message: "" })
    setSending(false)
  }

  return (
    <div>
      {/* Banner */}
      <div className="relative h-40 sm:h-56 md:h-72 lg:h-80 bg-gradient-to-br from-accent to-accent-foreground/20 overflow-hidden">
        {pyme.bannerUrl ? (
          <Image
            src={pyme.bannerUrl || "/placeholder.svg"}
            alt={`Banner de ${pyme.name}`}
            className="w-full h-full object-cover"
            fill
            priority={false}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{pyme.name}</h1>
              <p className="text-base sm:text-lg md:text-xl opacity-90">{pyme.description}</p>
            </div>
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 -mt-20 relative z-10 pb-12">
        {/* Logo and Info Card */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Logo */}
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 border-4 border-background shadow-lg">
                {pyme.avatarUrl && <AvatarImage src={pyme.avatarUrl || "/placeholder.svg"} alt={pyme.name} />}
                <AvatarFallback className="text-2xl sm:text-3xl md:text-4xl">{pyme.name.charAt(0)}</AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 md:mb-2">{pyme.name}</h1>
                <p className="text-muted-foreground mb-4">{pyme.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {pyme.address && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span>{pyme.address}</span>
                    </div>
                  )}

                  {pyme.hours && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span>{pyme.hours}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span>{pyme.phone}</span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <span>{pyme.email}</span>
                  </div>

                  {pyme.website && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Globe className="h-4 w-4 flex-shrink-0" />
                      <a href={pyme.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {pyme.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  )}

                  <Badge variant="secondary" className="w-fit">
                    <Truck className="h-3 w-3 mr-1" />
                    {fulfillmentLabels[pyme.fulfillment]}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {/* Listings */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Search + Filter */}
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar en las publicaciones..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Tabs value={typeFilter} onValueChange={(value) => setTypeFilter(value as "all" | "product" | "service")}>
                <TabsList>
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="product">Productos</TabsTrigger>
                  <TabsTrigger value="service">Servicios</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Listings Grid */}
            {filteredListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                {filteredListings.map((listing) => {
                  const category = categories.find((c) => c.id === listing.categoryId)
                  const listingPyme = allPymes.find((p) => p.id === listing.pymeId)
                  return <ListingCard key={listing.id} listing={listing} category={category} pyme={listingPyme} />
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  {searchQuery ? "No se encontraron publicaciones" : "Esta PYME aún no tiene publicaciones"}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Contact Form */}
          <div>
            <div className="lg:sticky lg:top-24">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Contactar por correo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Tu nombre</label>
                      <Input
                        placeholder="Juan Pérez"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Tu correo</label>
                      <Input
                        type="email"
                        placeholder="tu@email.com"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1.5 block">Mensaje</label>
                      <Textarea
                        placeholder="Escribe tu consulta aquí..."
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        required
                        rows={5}
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={sending}>
                      {sending ? "Enviando..." : "Enviar mensaje"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Quick contact */}
              {pyme.whatsapp && (
                <Card className="mt-4">
                  <CardContent className="pt-6">
                    <Button asChild className="w-full bg-transparent" variant="outline">
                      <a
                        href={`https://wa.me/${pyme.whatsapp.replace(/\D/g, "")}?text=Hola, vi tu negocio en TRAFKINTU`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        WhatsApp
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
