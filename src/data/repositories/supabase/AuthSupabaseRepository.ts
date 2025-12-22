import type { AuthRepository, RegisterData, User } from "@/domain/ports/AuthRepository"
import { supabaseBrowser } from "@/shared/lib/supabase/browser"

const LOCAL_USERS_KEY = "trafkintu_users"
const LOCAL_CURRENT_KEY = "trafkintu_current_user"

export class AuthSupabaseRepository implements AuthRepository {
  private localUsers: User[] = []
  private localCurrent: User | null = null

  constructor() {
    if (typeof window !== "undefined") {
      const savedUsers = localStorage.getItem(LOCAL_USERS_KEY)
      if (savedUsers) this.localUsers = JSON.parse(savedUsers)
      const savedCurrent = localStorage.getItem(LOCAL_CURRENT_KEY)
      if (savedCurrent) this.localCurrent = JSON.parse(savedCurrent)
    }
  }

  async login(email: string, password: string): Promise<User | null> {
    const supabase = supabaseBrowser()
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (!error && data.session) {
        const user = this.mapUser(data.session.user)
        this.syncRoleCookies(user)
        this.persistLocal(user)
        return user
      }
      console.warn("[auth] Supabase login falló, usando fallback local", error)
    }

    const local = this.localUsers.find((u) => u.email === email)
    if (local) {
      this.localCurrent = local
      this.syncRoleCookies(local)
      this.persistLocal(local)
      return local
    }
    return null
  }

  async register(data: RegisterData): Promise<User | null> {
    const supabase = supabaseBrowser()
    try {
      if (supabase) {
        const { data: signUp, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              role: data.role,
              rut: data.rut,
              display_name: data.displayName,
              pyme_id: data.role === "pyme" ? `pyme-${Date.now()}` : undefined,
            },
          },
        })

        if (!error && signUp.session) {
          const user = this.mapUser(signUp.session.user)
          this.syncRoleCookies(user)
          this.persistLocal(user)
          // Crea pyme asociada en Supabase cuando es rol pyme
          if (data.role === "pyme" && user.pymeId) {
            await supabase.from("pymes").insert({
              id: user.pymeId,
              owner_id: user.id,
              name: data.pymeName || data.displayName,
              description: "",
              email: data.email,
              phone: "",
              fulfillment: "local",
            })
          }
          return user
        }

        if (error?.message) {
          throw new Error(error.message)
        }
      }
    } catch (err) {
      console.warn("[auth] Supabase register error, intentando vía API", err)
    }

    // Fallback: llamar a API interna con service role
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        const user = (await res.json()) as User
        this.syncRoleCookies(user)
        this.persistLocal(user)
        return user
      }
      console.warn("[auth] API signup fallo", await res.text())
    } catch (err) {
      console.warn("[auth] API signup error", err)
    }

    const localUser: User = {
      id: `user-${Date.now()}`,
      email: data.email,
      role: data.role,
      rut: data.rut,
      displayName: data.displayName,
      pymeId: data.role === "pyme" ? `pyme-${Date.now()}` : undefined,
    }
    this.localUsers.push(localUser)
    this.localCurrent = localUser
    this.persistLocal(localUser)
    this.syncRoleCookies(localUser)
    // Crea pyme en tabla pymes cuando es rol pyme (si no hay supabase activo, esto se omite)
    if (data.role === "pyme" && localUser.pymeId && supabase) {
      await supabase.from("pymes").insert({
        id: localUser.pymeId,
        owner_id: localUser.id,
        name: data.pymeName || data.displayName,
        description: "",
        email: data.email,
        phone: "",
        fulfillment: "local",
      })
    }
    return localUser
  }

  async getCurrentUser(): Promise<User | null> {
    const supabase = supabaseBrowser()
    if (supabase) {
      const { data, error } = await supabase.auth.getSession()
      if (!error && data.session) {
        const user = this.mapUser(data.session.user)
        this.persistLocal(user)
        return user
      }
    }
    return this.localCurrent
  }

  async logout(): Promise<void> {
    const supabase = supabaseBrowser()
    if (supabase) {
      await supabase.auth.signOut()
    }
    if (typeof document !== "undefined") {
      document.cookie = "trafkintu_role=; path=/; max-age=0"
      document.cookie = "trafkintu_pyme=; path=/; max-age=0"
    }
    this.localCurrent = null
    if (typeof window !== "undefined") {
      localStorage.removeItem(LOCAL_CURRENT_KEY)
    }
  }

  private mapUser(authUser: any): User {
    const meta = authUser.user_metadata || {}
    return {
      id: authUser.id,
      email: authUser.email || "",
      role: meta.role,
      rut: meta.rut,
      displayName: meta.display_name,
      pymeId: meta.pyme_id,
    }
  }

  private syncRoleCookies(user: User) {
    if (typeof document === "undefined") return
    document.cookie = `trafkintu_role=${user.role}; path=/; max-age=604800`
    if (user.pymeId) {
      document.cookie = `trafkintu_pyme=${user.pymeId}; path=/; max-age=604800`
    }
  }

  private persistLocal(user: User | null) {
    if (typeof window === "undefined") return
    if (user) {
      this.localCurrent = user
      localStorage.setItem(LOCAL_CURRENT_KEY, JSON.stringify(user))
      if (!this.localUsers.find((u) => u.id === user.id)) {
        this.localUsers.push(user)
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(this.localUsers))
      }
    }
  }
}
