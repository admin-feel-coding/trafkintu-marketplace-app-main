"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Mail, Phone, MessageCircle, Check } from "lucide-react"
import type { Pyme } from "@/domain/entities/Pyme"

interface ContactButtonsProps {
  pyme: Pyme
  listingTitle: string
}

export function ContactButtons({ pyme, listingTitle }: ContactButtonsProps) {
  const [copiedPhone, setCopiedPhone] = useState(false)

  const handleWhatsApp = () => {
    const message = encodeURIComponent(`Hola! Me interesa "${listingTitle}" de ${pyme.name}`)
    window.open(`https://wa.me/${pyme.whatsapp}?text=${message}`, "_blank")
  }

  const handleEmail = () => {
    const subject = encodeURIComponent(`Consulta sobre ${listingTitle}`)
    const body = encodeURIComponent(`Hola ${pyme.name},\n\nMe interesa conocer más sobre "${listingTitle}".\n\n`)
    window.location.href = `mailto:${pyme.email}?subject=${subject}&body=${body}`
  }

  const handleCopyPhone = async () => {
    await navigator.clipboard.writeText(pyme.phone)
    setCopiedPhone(true)
    setTimeout(() => setCopiedPhone(false), 2000)
  }

  return (
    <div className="space-y-3">
      {pyme.whatsapp && (
        <Button onClick={handleWhatsApp} className="w-full" size="lg">
          <MessageCircle className="mr-2 h-5 w-5" />
          Contactar por WhatsApp
        </Button>
      )}

      <Button onClick={handleEmail} variant="outline" className="w-full bg-transparent" size="lg">
        <Mail className="mr-2 h-5 w-5" />
        Enviar correo
      </Button>

      <Button onClick={handleCopyPhone} variant="outline" className="w-full bg-transparent" size="lg">
        {copiedPhone ? <Check className="mr-2 h-5 w-5" /> : <Phone className="mr-2 h-5 w-5" />}
        {copiedPhone ? "Copiado" : `Copiar teléfono (${pyme.phone})`}
      </Button>
    </div>
  )
}
