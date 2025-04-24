import { redirect } from "next/navigation"

export default function AuthPage() {
  redirect("/auth/customer-login")
  return null
}

