"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "./ui/button"
import { authClient } from "@/lib/auth-client"

export function AdminNavEntry() {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    async function checkAdmin() {
      const session = await authClient.getSession()
      const user = session?.data?.user

      if (user?.role === "admin") {
        setIsAdmin(true)
      }
    }

    checkAdmin()
  }, [])

  if (!isAdmin) return null

  return (
    <Link href="/admin">
      <Button variant="ghost">Admin</Button>
    </Link>
  )
}