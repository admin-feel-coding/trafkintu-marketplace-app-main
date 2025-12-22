import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoginForm } from "@/features/auth/components/LoginForm"
import { RegisterForm } from "@/features/auth/components/RegisterForm"
import { Footer } from "@/shared/components/Footer"
import { Navbar } from "@/shared/components/Navbar"

export default function AuthPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center py-6 md:py-12">
        <div className="container mx-auto px-4">
          <div className="w-full max-w-md mx-auto">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Ingresar</TabsTrigger>
                <TabsTrigger value="register">Registrarse</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>Iniciar Sesión</CardTitle>
                    <CardDescription>Ingresa a tu cuenta de TRAFKINTU</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <LoginForm />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>Crear Cuenta</CardTitle>
                    <CardDescription>Únete a la comunidad de emprendedores locales</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RegisterForm />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Credenciales de prueba:</p>
              <p>Admin: admin@trafkintu.cl</p>
              <p>PYME: panaderia@test.cl</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
