"use client"

import React from "react"
import Button from "../elements/button"
import { useRouter } from "next/navigation"
import DataTable from "../blocks/data-table-product-type"
import ProductTypeProvider from "@/contexts/product-type-context"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEllipsisVertical, faSearch, faTrashCan } from "@fortawesome/free-solid-svg-icons"
import InputWithIcon from "../composites/input-with-icon"

export default function ProductTypesTemplate() {
  const title = "Product Types List"
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>

        <div>
          <Button
            onClick={() => router.push("/product-types/add-product-type")}
            className="flex items-center bg-[#017082] px-4 py-2 text-white"
          >
            <svg
              className="inline-block w-10"
              width="25"
              height="25"
              viewBox="0 0 25 25"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.5 0.6875C9.37889 0.72537 6.39629 1.98206 4.18917 4.18917C1.98206 6.39629 0.72537 9.37889 0.6875 12.5C0.72537 15.6211 1.98206 18.6037 4.18917 20.8108C6.39629 23.0179 9.37889 24.2746 12.5 24.3125C15.6211 24.2746 18.6037 23.0179 20.8108 20.8108C23.0179 18.6037 24.2746 15.6211 24.3125 12.5C24.2746 9.37889 23.0179 6.39629 20.8108 4.18917C18.6037 1.98206 15.6211 0.72537 12.5 0.6875ZM19.25 13.3438H13.3438V19.25H11.6562V13.3438H5.75V11.6562H11.6562V5.75H13.3438V11.6562H19.25V13.3438Z"
                fill="white"
              />
            </svg>

            <span className="inline-block">Add Product Type</span>
          </Button>
        </div>
      </div>

      <ProductTypeProvider>
        <div className="flex items-center gap-2">
          <div>
            <Button>
              <FontAwesomeIcon icon={faTrashCan} />
            </Button>

            <Button>
              <FontAwesomeIcon icon={faEllipsisVertical} />
            </Button>
          </div>

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
      </ProductTypeProvider>
    </div>
  )
}
