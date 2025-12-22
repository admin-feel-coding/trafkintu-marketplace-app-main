"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { authMockRepository } from "@/data/repositories/AuthMockRepository"
import { RUT } from "@/domain/value-objects/RUT"

export function RegisterForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [role, setRole] = useState<"user" | "pyme">("user")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rut, setRut] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [pymeName, setPymeName] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate RUT
      const validRut = RUT.create(rut)
      if (!validRut) {
        toast.error("RUT inválido. Verifica el formato y dígito verificador.")
        setIsLoading(false)
        return
      }

      // Validate PYME fields
      if (role === "pyme" && !pymeName.trim()) {
        toast.error("Debes ingresar el nombre de tu PYME")
        setIsLoading(false)
        return
      }

      const user = await authMockRepository.register({
        email,
        password,
        role,
        rut,
        displayName,
        pymeName: role === "pyme" ? pymeName : undefined,
      })

      if (user) {
        toast.success("Cuenta creada exitosamente")

        // Redirect based on role
        if (user.role === "pyme") {
          router.push("/dashboard")
        } else {
          router.push("/")
        }
      } else {
        toast.error("Error al crear la cuenta")
      }
    } catch (error) {
      toast.error("Error al registrar usuario")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
      <div className="space-y-2">
        <Label htmlFor="register-role">Tipo de cuenta</Label>
        <Select value={role} onValueChange={(v) => setRole(v as "user" | "pyme")}>
          <SelectTrigger id="register-role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">Usuario</SelectItem>
            <SelectItem value="pyme">PYME / Emprendimiento</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email">Correo electrónico</Label>
        <Input
          id="register-email"
          type="email"
          placeholder="tu@correo.cl"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password">Contraseña</Label>
        <Input
          id="register-password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-rut">RUT</Label>
        <Input
          id="register-rut"
          type="text"
          placeholder="12.345.678-9"
          value={rut}
          onChange={(e) => setRut(e.target.value)}
          required
        />
        <p className="text-xs text-muted-foreground">Formato: 12.345.678-9 o 12345678-9</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-displayName">{role === "user" ? "Nombre visible" : "Tu nombre"}</Label>
        <Input
          id="register-displayName"
          type="text"
          placeholder={role === "user" ? "Juan Pérez" : "Tu nombre"}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />
      </div>

      {role === "pyme" && (
        <div className="space-y-2">
          <Label htmlFor="register-pymeName">Nombre de la PYME</Label>
          <Input
            id="register-pymeName"
            type="text"
            placeholder="Mi Emprendimiento"
            value={pymeName}
            onChange={(e) => setPymeName(e.target.value)}
            required={role === "pyme"}
          />
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creando cuenta..." : "Registrarse"}
      </Button>
    </form>
  )
}
