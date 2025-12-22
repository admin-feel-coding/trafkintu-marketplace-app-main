"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Clock, FileText, Globe, LogOut, Mail, MapPin, Phone, Settings, Store, Upload, Image as ImageIcon, User } from "lucide-react"
import { toast } from "sonner"

import type { Category } from "@/domain/entities/Category"
import type { Listing } from "@/domain/entities/Listing"
import type { Pyme } from "@/domain/entities/Pyme"
import { marketplaceMockRepository } from "@/data/repositories/MarketplaceMockRepository"
import { getMyListingsAction } from "@/features/pymes/actions/listingActions"
import { getPymeByIdAction, updatePymeAction } from "@/features/pymes/actions/pymeActions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Footer } from "@/shared/components/Footer"
import { Navbar } from "@/shared/components/Navbar"
import { useAuth } from "@/features/auth/hooks/useAuth"

const fulfillmentLabels: Record<Pyme["fulfillment"], string> = {
  local: "Retiro local",
  delivery: "Despacho a domicilio",
  both: "Retiro y despacho",
}

export default function ProfilePage() {
  const { user, isLoading: authLoading, logout } = useAuth()
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<"profile" | "posts" | "settings">("profile")
  const [pyme, setPyme] = useState<Pyme | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    email: "",
    phone: "",
    whatsapp: "",
    address: "",
    hours: "",
    website: "",
    avatarUrl: "",
    bannerUrl: "",
  })

  const handleLogout = () => {
    logout()
    router.push("/auth")
  }

  const handleSaveSettings = async () => {
    if (!user?.pymeId) return
    setIsSaving(true)
    try {
      const updatedPyme = await updatePymeAction(user.pymeId, formData)
      setPyme(updatedPyme)
      toast.success("Cambios guardados exitosamente")
    } catch (error) {
      toast.error("Error al guardar los cambios")
    }
    setIsSaving(false)
  }

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push("/auth")
      return
    }

    async function loadData() {
      setLoading(true)
      if (user.role === "pyme" && user.pymeId) {
        const [pymeData, myListings, loadedCategories] = await Promise.all([
          getPymeByIdAction(user.pymeId),
          getMyListingsAction(user.pymeId),
          marketplaceMockRepository.getCategories(),
        ])

        if (pymeData) {
          setPyme(pymeData)
          setFormData({
            name: pymeData.name,
            description: pymeData.description || "",
            email: pymeData.email,
            phone: pymeData.phone,
            whatsapp: pymeData.whatsapp || "",
            address: pymeData.address || "",
            hours: pymeData.hours || "",
            website: pymeData.website || "",
            avatarUrl: pymeData.avatarUrl || "",
            bannerUrl: pymeData.bannerUrl || "",
          })
        }

        setListings(myListings)
        setCategories(loadedCategories)
      }

      setLoading(false)
    }

    loadData()
  }, [user, authLoading, router])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList
              className="grid w-full max-w-md mx-auto"
              style={{ gridTemplateColumns: user?.role === "pyme" ? "repeat(3, 1fr)" : "1fr" }}
            >
              <TabsTrigger value="profile">
                <User className="h-4 w-4 mr-2" />
                Mi Perfil
              </TabsTrigger>
              {user?.role === "pyme" && (
                <>
                  <TabsTrigger value="posts">
                    <FileText className="h-4 w-4 mr-2" />
                    Mis Publicaciones
                  </TabsTrigger>
                  <TabsTrigger value="settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Configuración
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              {user.role === "pyme" && pyme ? (
                <>
                  {/* Banner */}
                  <div className="relative h-48 md:h-64 bg-gradient-to-br from-accent to-accent-foreground/20 overflow-hidden rounded-lg">
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
                        <div className="text-center text-white">
                          <h1 className="text-3xl font-bold mb-2">{pyme.name}</h1>
                          <p className="text-lg opacity-90">{pyme.description}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info Card */}
                  <Card className="-mt-16 relative z-10">
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                          {pyme.avatarUrl && <AvatarImage src={pyme.avatarUrl || "/placeholder.svg"} alt={pyme.name} />}
                          <AvatarFallback className="text-3xl">{pyme.name.charAt(0)}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <h1 className="text-2xl font-bold">{pyme.name}</h1>
                            <Button variant="outline" size="sm" onClick={() => router.push(`/pyme/${pyme.id}`)}>
                              Ver perfil público
                            </Button>
                          </div>
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
                              {fulfillmentLabels[pyme.fulfillment]}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Publicaciones */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Mis Publicaciones ({listings.length})</CardTitle>
                        <Button onClick={() => router.push("/dashboard")}>
                          <Store className="h-4 w-4 mr-2" />
                          Administrar
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {listings.length === 0 ? (
                        <div className="text-center py-12">
                          <Store className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-semibold mb-2">No tienes publicaciones</h3>
                          <p className="text-muted-foreground mb-4">Crea tu primera publicación en el panel de gestión</p>
                          <Button onClick={() => router.push("/dashboard")}>Ir al Panel de Gestión</Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {listings.slice(0, 6).map((listing) => (
                            <Card
                              key={listing.id}
                              className="cursor-pointer hover:shadow-lg transition-shadow"
                              onClick={() => router.push(`/listing/${listing.id}`)}
                            >
                              <CardContent className="p-4">
                                <div className="aspect-video bg-muted rounded-md mb-3 overflow-hidden">
                                  {listing.images?.[0] ? (
                                    <Image
                                      src={listing.images[0] || "/placeholder.svg"}
                                      alt={listing.title}
                                      className="w-full h-full object-cover"
                                      fill
                                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                                <h3 className="font-semibold mb-1 text-sm line-clamp-1">{listing.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
                                <Badge variant="secondary" className="mt-2">
                                  {categories.find((c) => c.id === listing.categoryId)?.name || "Otro"}
                                </Badge>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-6 mb-6">
                      <Avatar className="h-24 w-24">
                        <AvatarFallback className="text-3xl">{user.email.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="text-2xl font-bold">{user.email}</h2>
                        <p className="text-muted-foreground">{user.email}</p>
                        <Badge variant="secondary" className="mt-2">
                          Usuario
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label>RUT</Label>
                        <p className="text-sm text-muted-foreground">{user.rut}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="pt-6">
                  <Button variant="destructive" onClick={handleLogout} className="w-full">
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {user.role === "pyme" && (
              <TabsContent value="posts" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Mis Publicaciones ({listings.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {listings.length === 0 ? (
                      <div className="text-center py-12">
                        <Store className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">No tienes publicaciones</h3>
                        <p className="text-muted-foreground mb-4">Crea tu primera publicación en el panel de gestión</p>
                        <Button onClick={() => router.push("/dashboard")}>Ir al Panel de Gestión</Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {listings.slice(0, 6).map((listing) => (
                          <Card
                            key={listing.id}
                            className="cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={() => router.push(`/listing/${listing.id}`)}
                          >
                            <CardContent className="p-4">
                              <div className="aspect-video bg-muted rounded-md mb-3 overflow-hidden">
                                {listing.images?.[0] ? (
                                  <Image
                                    src={listing.images[0] || "/placeholder.svg"}
                                    alt={listing.title}
                                    className="w-full h-full object-cover"
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <h3 className="font-semibold mb-1 text-sm line-clamp-1">{listing.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
                              <Badge variant="secondary" className="mt-2">
                                {categories.find((c) => c.id === listing.categoryId)?.name || "Otro"}
                              </Badge>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {user.role === "pyme" && (
              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Configuración del Negocio</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Imágenes */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        Imágenes
                      </h3>

                      <div className="space-y-2">
                        <Label htmlFor="bannerUrl">URL del Banner (1200x400px recomendado)</Label>
                        <Input
                          id="bannerUrl"
                          placeholder="https://ejemplo.com/banner.jpg"
                          value={formData.bannerUrl}
                          onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                        />
                        {formData.bannerUrl && (
                          <div className="relative aspect-[3/1] bg-muted rounded-md overflow-hidden">
                            <Image
                              src={formData.bannerUrl || "/placeholder.svg"}
                              alt="Preview banner"
                              className="object-cover"
                              fill
                              sizes="100vw"
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="avatarUrl">URL del Logo (500x500px recomendado)</Label>
                        <Input
                          id="avatarUrl"
                          placeholder="https://ejemplo.com/logo.jpg"
                          value={formData.avatarUrl}
                          onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                        />
                        {formData.avatarUrl && (
                          <div className="relative w-32 h-32 rounded-full bg-muted overflow-hidden">
                            <Image
                              src={formData.avatarUrl || "/placeholder.svg"}
                              alt="Preview logo"
                              className="object-cover"
                              fill
                              sizes="128px"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="border-t pt-6 space-y-4">
                      <h3 className="text-lg font-semibold">Información General</h3>

                      <div className="space-y-2">
                        <Label htmlFor="name">
                          <Store className="h-4 w-4 inline mr-2" />
                          Nombre del Negocio
                        </Label>
                        <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={4}
                        />
                      </div>
                    </div>

                    <div className="border-t pt-6 space-y-4">
                      <h3 className="text-lg font-semibold">Información de Contacto</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">
                            <Mail className="h-4 w-4 inline mr-2" />
                            Email
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">
                            <Phone className="h-4 w-4 inline mr-2" />
                            Teléfono
                          </Label>
                          <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="whatsapp">WhatsApp</Label>
                          <Input
                            id="whatsapp"
                            value={formData.whatsapp}
                            onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                            placeholder="+56912345678"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="website">
                            <Globe className="h-4 w-4 inline mr-2" />
                            Sitio Web
                          </Label>
                          <Input
                            id="website"
                            value={formData.website}
                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            placeholder="https://www.ejemplo.com"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-6 space-y-4">
                      <h3 className="text-lg font-semibold">Ubicación y Horarios</h3>

                      <div className="space-y-2">
                        <Label htmlFor="address">
                          <MapPin className="h-4 w-4 inline mr-2" />
                          Dirección
                        </Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          placeholder="Av. Libertador 1234, Santiago"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="hours">
                          <Clock className="h-4 w-4 inline mr-2" />
                          Horario de atención
                        </Label>
                        <Input
                          id="hours"
                          value={formData.hours}
                          onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                          placeholder="Lun-Vie 9:00-18:00, Sáb 10:00-14:00"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button onClick={handleSaveSettings} disabled={isSaving}>
                        {isSaving ? "Guardando..." : "Guardar Cambios"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}
