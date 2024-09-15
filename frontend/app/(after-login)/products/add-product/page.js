import AddProductFormTemplate from "@/components/structures/add-product-form"
import AddProductFormProvider from "@/contexts/add-product-form-context"
import React from "react"

export default function AddProductPage() {
  const title = "Add New Product"

  return (
    <div>
      <h2 className="my-4 text-2xl font-bold">{title}</h2>

      <AddProductFormProvider>
        <div>
          <AddProductFormTemplate />
        </div>
      </AddProductFormProvider>
    </div>
  )
}
