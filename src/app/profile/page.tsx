"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { BadgeCheck, Clock, FileText, Globe, LogOut, Mail, MapPin, Phone, Settings, Store, Upload, Image as ImageIcon, User } from "lucide-react"
import { toast } from "sonner"

import type { Category } from "@/domain/entities/Category"
import type { Listing } from "@/domain/entities/Listing"
import type { Pyme } from "@/domain/entities/Pyme"
import { marketplaceRepository } from "@/data/repositories/marketplace"
import { getMyListingsAction } from "@/features/pymes/actions/listingActions"
import { getPymeByIdAction, requestPymeVerificationAction, updatePymeAction } from "@/features/pymes/actions/pymeActions"
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
import { SingleImageUploader } from "@/shared/components/SingleImageUploader"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { RUT } from "@/domain/value-objects/RUT"

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
  const [isRequestingVerification, setIsRequestingVerification] = useState(false)
  const [verificationRut, setVerificationRut] = useState("")

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

  const verificationLabels: Record<Pyme["verificationStatus"], string> = {
    unverified: "No verificada",
    pending: "En trámite",
    verified: "Verificada",
  }

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

  const handleRequestVerification = async () => {
    if (!user?.pymeId) return

    if (!RUT.isValidFormat(verificationRut)) {
      toast.error("Formato de RUT inválido. Usa 12345678-9 o 12.345.678-9")
      return
    }

    const validRut = RUT.create(verificationRut)
    if (!validRut) {
      toast.error("El dígito verificador del RUT es incorrecto")
      return
    }

    setIsRequestingVerification(true)
    try {
      const updatedPyme = await requestPymeVerificationAction(user.pymeId, validRut.toString())
      if (updatedPyme) {
        setPyme(updatedPyme)
        setVerificationRut(validRut.toString())
        toast.success("Solicitud enviada. Revisaremos tu PYME en SII.")
      } else {
        toast.error("No se pudo enviar la solicitud")
      }
    } catch (error) {
      toast.error("Error al solicitar verificación")
    } finally {
      setIsRequestingVerification(false)
    }
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
          marketplaceRepository.getCategories(),
        ])

        if (pymeData) {
          setPyme(pymeData)
          setFormData({
            name: pymeData.name,
            description: pymeData.description || "",
            email: pymeData.email || user.email,
            phone: pymeData.phone,
            whatsapp: pymeData.whatsapp || "",
            address: pymeData.address || "",
            hours: pymeData.hours || "",
            website: pymeData.website || "",
            avatarUrl: pymeData.avatarUrl || "",
            bannerUrl: pymeData.bannerUrl || "",
          })
          setVerificationRut(pymeData.rut || "")
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
      <main className="flex-1 container mx-auto px-4 py-4 md:py-8">
        <div className="max-w-6xl mx-auto">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "profile" | "posts" | "settings")} className="space-y-6">
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
                  <div className="relative h-32 sm:h-48 md:h-64 bg-gradient-to-br from-accent to-accent-foreground/20 overflow-hidden rounded-lg">
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
                  <Card className="-mt-8 sm:-mt-12 mx-4 relative z-10">
                    <CardContent className="pt-4 sm:pt-6">
                      <div className="flex flex-col gap-4">
                        {/* Header with avatar and name */}
                        <div className="flex items-center gap-4">
                          <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-4 border-background shadow-lg flex-shrink-0">
                            {pyme.avatarUrl && <AvatarImage src={pyme.avatarUrl} alt={pyme.name} />}
                            <AvatarFallback className="text-xl sm:text-2xl">
                              {pyme.name ? pyme.name.charAt(0).toUpperCase() : "P"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h1 className="text-xl sm:text-2xl font-bold truncate">
                                {pyme.name || "Mi Negocio"}
                              </h1>
                              {pyme.verificationStatus === "verified" && (
                                <Badge variant="secondary" className="gap-1 bg-emerald-100 text-emerald-800">
                                  <BadgeCheck className="h-3 w-3" />
                                  Verificada
                                </Badge>
                              )}
                            </div>
                            {pyme.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">{pyme.description}</p>
                            )}
                          </div>
                        </div>

                        {/* Action button */}
                        <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => router.push(`/pyme/${pyme.id}`)}>
                          Ver perfil público
                        </Button>

                        {/* Contact info */}
                        <div className="grid grid-cols-1 gap-2 text-sm border-t pt-4">
                          {pyme.phone && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="h-4 w-4 flex-shrink-0" />
                              <span>{pyme.phone}</span>
                            </div>
                          )}

                          {pyme.email && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate">{pyme.email}</span>
                            </div>
                          )}

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

                          {pyme.website && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Globe className="h-4 w-4 flex-shrink-0" />
                              <a href={pyme.website} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                                {pyme.website.replace(/^https?:\/\//, "")}
                              </a>
                            </div>
                          )}

                          <Badge variant="secondary" className="w-fit mt-1">
                            {fulfillmentLabels[pyme.fulfillment]}
                          </Badge>
                        </div>

                        {/* Prompt to complete profile */}
                        {(!pyme.phone || !pyme.email || !pyme.name) && (
                          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3 text-sm">
                            <p className="text-amber-800 dark:text-amber-200">
                              Completa tu perfil en <button type="button" onClick={() => setActiveTab("settings")} className="underline font-medium">Configuración</button> para que los clientes puedan contactarte.
                            </p>
                          </div>
                        )}
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
                                <div className="relative aspect-video bg-muted rounded-md mb-3 overflow-hidden">
                                  {listing.images?.[0] ? (
                                    <Image
                                      src={listing.images[0]}
                                      alt={listing.title}
                                      className="object-cover"
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
                              <div className="relative aspect-video bg-muted rounded-md mb-3 overflow-hidden">
                                {listing.images?.[0] ? (
                                  <Image
                                    src={listing.images[0]}
                                    alt={listing.title}
                                    className="object-cover"
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
                        <Label>Banner (1200x400px recomendado)</Label>
                        <SingleImageUploader
                          value={formData.bannerUrl}
                          onChange={(url) => setFormData({ ...formData, bannerUrl: url })}
                          userId={user?.id || ""}
                          aspectRatio="banner"
                          placeholder="Subir banner"
                          disabled={isSaving}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Logo (500x500px recomendado)</Label>
                        <SingleImageUploader
                          value={formData.avatarUrl}
                          onChange={(url) => setFormData({ ...formData, avatarUrl: url })}
                          userId={user?.id || ""}
                          aspectRatio="square"
                          placeholder="Subir logo"
                          disabled={isSaving}
                        />
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
                {pyme && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Verificacion SII</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Estado:</span>
                        <Badge variant="secondary">{verificationLabels[pyme.verificationStatus]}</Badge>
                      </div>

                      {pyme.verificationStatus === "unverified" && pyme.verificationNote && (
                        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                          Comentario del administrador: {pyme.verificationNote}
                        </div>
                      )}

                      {pyme.verificationStatus === "unverified" && (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="verification-rut">RUT de la empresa</Label>
                            <Input
                              id="verification-rut"
                              value={verificationRut}
                              onChange={(e) => setVerificationRut(e.target.value)}
                              onBlur={() => {
                                if (verificationRut && RUT.isValidFormat(verificationRut)) {
                                  setVerificationRut(RUT.normalize(verificationRut))
                                }
                              }}
                              placeholder="12345678-9"
                            />
                            <p className="text-xs text-muted-foreground">Usaremos este RUT para validar tu PYME en SII.</p>
                          </div>
                          <Button onClick={handleRequestVerification} disabled={isRequestingVerification}>
                            {isRequestingVerification ? "Enviando..." : "Solicitar verificacion"}
                          </Button>
                        </div>
                      )}

                      {pyme.verificationStatus === "pending" && (
                        <div className="space-y-2 text-sm text-muted-foreground">
                          <p>Tu solicitud esta en revision.</p>
                          {pyme.verificationRequestedAt && (
                            <p>Fecha solicitud: {new Date(pyme.verificationRequestedAt).toLocaleDateString("es-CL")}</p>
                          )}
                        </div>
                      )}

                      {pyme.verificationStatus === "verified" && (
                        <div className="flex items-center gap-2 text-sm text-emerald-700">
                          <BadgeCheck className="h-4 w-4" />
                          Tu PYME esta verificada en SII.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  )
}
