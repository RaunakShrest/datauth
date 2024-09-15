import EditRetailerForm from "@/components/structures/retailer-edit-form"
import EditSingleRetailerProvider from "@/contexts/edit-single-retailer-form"
import React from "react"

export default function SingleRetailerEdit() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl">Edit Retailer</h2>
      </div>

      <div>
        <EditSingleRetailerProvider>
          <EditRetailerForm />
        </EditSingleRetailerProvider>
      </div>
    </div>
  )
}