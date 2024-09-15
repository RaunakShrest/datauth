import AddProdcutTypeFormTemplate from "@/components/structures/add-product-type-form"
import FormContextProvider from "@/contexts/add-product-type-form-context"
import React from "react"

export default function AddProductTypePage() {
  const title = "Add New Product Type"

  return (
    <div>
      <h2 className="my-4 text-2xl font-bold">{title}</h2>

      <FormContextProvider>
        <div>
          <AddProdcutTypeFormTemplate />
        </div>
      </FormContextProvider>
    </div>
  )
}
