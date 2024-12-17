import AddProdcutTypeFormTemplate from "@/components/structures/add-product-type-form"
import FormContextProvider from "@/contexts/add-product-type-form-context"
import RequireRole from "@/contexts/require-auth/require-role"
import React from "react"

export default function AddProductTypePage() {
  const title = "Add New Product Type"

  return (
    <div>
      <h2 className="my-4 text-2xl font-bold">{title}</h2>

      <FormContextProvider>
        <div>
          <RequireRole roles={[process.env.NEXT_PUBLIC_USER_TYPE_SUPER_ADMIN]}>
            <AddProdcutTypeFormTemplate />
          </RequireRole>
        </div>
      </FormContextProvider>
    </div>
  )
}
