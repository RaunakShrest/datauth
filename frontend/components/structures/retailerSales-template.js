import React from "react"
import DataTable from "../blocks/data-table-retailerSales"
import RetailerSalesProvider from "@/contexts/retailerSales-context"

export default function RetailerSalesTemplate() {
  const title = "Retailer Sales"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-5xl font-bold">{title}</h2>
      </div>

      <RetailerSalesProvider>
        <div className="flex items-center gap-2"></div>

        <div>
          <DataTable />
        </div>
      </RetailerSalesProvider>
    </div>
  )
}
