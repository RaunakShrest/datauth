import RetailersTemplate from "@/components/structures/retailers-template"
import React from "react"
import RequireRole from "@/contexts/require-auth/require-role"

export default function RetailersPage() {
  return(
 <RequireRole roles={[process.env.NEXT_PUBLIC_USER_TYPE_SUPER_ADMIN,
process.env.NEXT_PUBLIC_USER_TYPE_COMPANY,
]}>
   <RetailersTemplate />
   </RequireRole>
  )
}
