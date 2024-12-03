"use client"

import CompaniesProvider from "@/contexts/companies-context"
import React from "react"
import DataTable from "../blocks/data-table-companies"
import { useRouter } from "next/navigation"

export default function CompaniesTemplate() {
  const title = "Companies List"

  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-5xl font-bold">{title}</h2>
      </div>

      <CompaniesProvider>
        <div className="flex items-center gap-2"></div>

        <div>
          <DataTable />
        </div>
      </CompaniesProvider>
    </div>
  )
}
