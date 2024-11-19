import React from "react"
import RequireRole from "@/contexts/require-auth/require-role"
import BatchTemplate from "@/components/structures/batch-template"

export default function BatchPage() {
  return (
    <div>
      <RequireRole roles={[process.env.NEXT_PUBLIC_USER_TYPE_SUPER_ADMIN, process.env.NEXT_PUBLIC_USER_TYPE_COMPANY]}>
        <BatchTemplate />
      </RequireRole>
    </div>
  )
}
