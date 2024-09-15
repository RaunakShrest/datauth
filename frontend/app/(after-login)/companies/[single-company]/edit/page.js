import EditCompanyForm from "@/components/structures/company-edit-form"
import EditSingleCompanyProvider from "@/contexts/edit-single-company-form"
import React from "react"

export default function SingleCompanyEdit() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl">Edit Company</h2>
      </div>

      <div>
        <EditSingleCompanyProvider>
          <EditCompanyForm />
        </EditSingleCompanyProvider>
      </div>
    </div>
  )
}
