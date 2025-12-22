import Link from "next/link"
import { Store } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-muted/50 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-4">
              <Store className="h-5 w-5 text-primary" />
              <span>TRAFKINTU</span>
            </Link>
            <p className="text-sm text-muted-foreground">Conectando emprendedores locales con la comunidad</p>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Explorar</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/explore" className="text-muted-foreground hover:text-foreground">
                  Todos los productos
                </Link>
              </li>
              <li>
                <Link href="/explore?type=product" className="text-muted-foreground hover:text-foreground">
                  Productos
                </Link>
              </li>
              <li>
                <Link href="/explore?type=service" className="text-muted-foreground hover:text-foreground">
                  Servicios
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Para Emprendedores</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/auth" className="text-muted-foreground hover:text-foreground">
                  Registrar mi PYME
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                  Mi panel
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Información</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-muted-foreground">Acerca de</span>
              </li>
              <li>
                <span className="text-muted-foreground">Contacto</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© 2025 TRAFKINTU. Conectando comunidades locales.</p>
        </div>
      </div>
    </footer>
  )
}
