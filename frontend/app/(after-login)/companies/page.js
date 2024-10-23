import CompaniesTemplate from "@/components/structures/companies-template"
import RequireRole from "@/contexts/require-auth/require-role"
import React from "react"

export default function CompaniesPage() {
  return (
    <RequireRole roles={[
        process.env.NEXT_PUBLIC_USER_TYPE_SUPER_ADMIN,
        process.env.NEXT_PUBLIC_USER_TYPE_RETAILER
      ]}>
      <CompaniesTemplate />
    </RequireRole>
  )
}
