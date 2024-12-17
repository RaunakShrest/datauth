import ProductTypesTemplate from "@/components/structures/product-types-template"
import React from "react"
import RequireRole from "@/contexts/require-auth/require-role"

export default function ProductTypesPage() {
  return (
    <div>
      <RequireRole roles={[process.env.NEXT_PUBLIC_USER_TYPE_SUPER_ADMIN]}>
        <ProductTypesTemplate />
      </RequireRole>
    </div>
  )
}
