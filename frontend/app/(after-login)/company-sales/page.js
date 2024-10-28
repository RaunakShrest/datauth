import CompanySalesTemplate from "@/components/structures/companySales-template"
import React from "react"
import RequireRole from "@/contexts/require-auth/require-role"

export default function CompanySalesPage() {
  return (
    <RequireRole roles={[process.env.NEXT_PUBLIC_USER_TYPE_SUPER_ADMIN, process.env.NEXT_PUBLIC_USER_TYPE_COMPANY]}>
      <CompanySalesTemplate />
    </RequireRole>
  )
}
