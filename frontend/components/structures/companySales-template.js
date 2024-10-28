import React from "react"
import Button from "../elements/button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEllipsisVertical, faTrashCan } from "@fortawesome/free-solid-svg-icons"
import DataTable from "../blocks/data-table-companySales"
import CompanySalesProvider from "@/contexts/companySales-context"

export default function CompanySalesTemplate() {
  const title = "Company Sales"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
      </div>

      <CompanySalesProvider>
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
      </CompanySalesProvider>
    </div>
  )
}
