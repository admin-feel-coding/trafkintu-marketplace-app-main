export interface LoginFormValues {
  email: string
  password: string
}

export interface RegisterFormValues {
  email: string
  password: string
  rut: string
  displayName: string
  role: "user" | "pyme"
  pymeName?: string
}
