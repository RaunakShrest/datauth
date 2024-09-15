import ViewSingleProduct from "@/components/structures/view-single-product"
import RequireRole from "@/contexts/require-auth/require-role"
import React from "react"

export default function SingleProduct() {
  return (
    <RequireRole
      roles={[
        process.env.NEXT_PUBLIC_USER_TYPE_SUPER_ADMIN,
        process.env.NEXT_PUBLIC_USER_TYPE_COMPANY,
        process.env.NEXT_PUBLIC_USER_TYPE_RETAILER,
      ]}
    >
      <ViewSingleProduct />
    </RequireRole>
  )
}
