import React from "react"
import Button from "../elements/button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEllipsisVertical, faTrashCan } from "@fortawesome/free-solid-svg-icons"
import DataTable from "../blocks/data-table-retailerSales"
import RetailerSalesProvider from "@/contexts/retailerSales-context"

export default function RetailerSalesTemplate() {
  const title = "Retailer Sales"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>

      <RetailerSalesProvider>
        <div className="flex items-center gap-2">
          <div>
            <Button>
              <FontAwesomeIcon icon={faTrashCan} />
            </Button>

            <Button>
              <FontAwesomeIcon icon={faEllipsisVertical} />
            </Button>
          </div>
        </div>

        <div>
          <DataTable />
        </div>
      </RetailerSalesProvider>
    </div>
  )
}
