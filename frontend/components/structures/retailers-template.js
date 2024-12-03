import React from "react"
import RetailersProvider from "@/contexts/retailers-context"
import DataTable from "../blocks/data-table-retailers"

export default function RetailersTemplate() {
  const title = "Retailers List"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-5xl font-bold">{title}</h2>
      </div>

      <RetailersProvider>
        <div className="flex items-center gap-2">
          {/* <InputWithIcon
            wrapperClassName="w-[500px] rounded-none border-0 border-b-2 gap-2"
            inputClassName="p-0 bg-transparent"
            iconElement={
              <FontAwesomeIcon
                icon={faSearch}
                className="fa-fw opacity-50"
              />
            }
            inputAttributes={{ placeholder: "Search" }}
          /> */}
        </div>

        <div>
          <DataTable />
        </div>
      </RetailersProvider>
    </div>
  )
}
