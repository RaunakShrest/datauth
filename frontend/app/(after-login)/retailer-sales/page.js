import RetailerSalesTemplate from "@/components/structures/retailerSales-template"
import React from "react"
import RequireRole from "@/contexts/require-auth/require-role"

export default function RetailerSalesPage() {
  return (
    <RequireRole roles={[process.env.NEXT_PUBLIC_USER_TYPE_SUPER_ADMIN, process.env.NEXT_PUBLIC_USER_TYPE_RETAILER]}>
      <RetailerSalesTemplate />
    </RequireRole>
  )
}
