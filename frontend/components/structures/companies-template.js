"use client"

import CompaniesProvider from "@/contexts/companies-context"
import React from "react"
import Button from "../elements/button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEllipsisVertical, faSearch, faTrashCan } from "@fortawesome/free-solid-svg-icons"
import DataTable from "../blocks/data-table-companies"
import { useRouter } from "next/navigation"

export default function CompaniesTemplate() {
  const title = "Companies List"

  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>

      </div>

      <CompaniesProvider>
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
      </CompaniesProvider>
    </div>
  )
}
