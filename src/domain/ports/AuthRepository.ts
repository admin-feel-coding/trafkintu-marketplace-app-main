export interface User {
  id: string
  email: string
  role: "user" | "pyme" | "admin"
  rut: string
  displayName: string
  pymeId?: string
}

export interface AuthRepository {
  login(email: string, password: string): Promise<User | null>
  register(data: RegisterData): Promise<User | null>
  getCurrentUser(): Promise<User | null>
  logout(): Promise<void>
}

export interface RegisterData {
  email: string
  password: string
  role: "user" | "pyme"
  rut: string
  displayName: string
  pymeName?: string
  phone?: string
}
