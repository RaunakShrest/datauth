"use client"

import React, { useRef, useState } from "react"
import Table from "./table"
import { twMerge } from "tailwind-merge"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons"
import { useProductType } from "@/contexts/product-type-context"
import Pagination from "../composites/pagination"
import Checkbox from "../elements/checkbox"
import ContextMenu from "./context-menu"
import { useRouter } from "next/navigation"
import axios from "axios"

export default function DataTable() {
  const router = useRouter()
  const tableRef = useRef()
  const contextMenuRef = useRef()

  const { data, selectedData, sortData, setSelectedData, fetchProductTypes } = useProductType()

  const [currentPage, setCurrentPage] = useState(1)
  const numberofDataPerPage = 8
  const indexOfLastData = currentPage * numberofDataPerPage
  const indexOfFirstData = indexOfLastData - numberofDataPerPage

  const currentData = data?.data?.slice(indexOfFirstData, indexOfLastData) || []

  const isTableDataSelected = (dataToVerify) => {
    return selectedData.some((eachSelected) => eachSelected.name === dataToVerify.name)
  }

  const isTableHeadingSelected = () => {
    const isAllDataSelected = data.data?.every((datum) =>
      selectedData.some((eachSelected) => eachSelected.name === datum.name),
    )

    return isAllDataSelected
  }

  const handleTableHeadingCheckboxChange = () => {
    setSelectedData((prev) =>
      prev.length > 0 ? (prev.length < data.data.length ? [...data.data] : []) : [...data.data],
    )
  }
  const handleTableDataCheckboxChange = (clickedData) => {
    setSelectedData((prev) =>
      isTableDataSelected(clickedData)
        ? prev.filter((eachPrev) => eachPrev.name !== clickedData.name)
        : [...prev, clickedData],
    )
  }
  const handleChangeStatus = async (productTypeId, currentStatus) => {
    try {
      const newStatus = currentStatus === "enabled" ? "disabled" : "enabled"
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/product-types/changeStatus/${productTypeId}`,
        { status: newStatus },
      )

      if (response.status === 200) {
        fetchProductTypes()
      } else {
        alert("Failed to update status")
      }
    } catch (error) {
      console.error("Error updating status:", error)
      alert("Error updating status")
    }
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg">
        <Table
          className="w-full table-fixed border-collapse"
          tableRef={tableRef}
        >
          <Table.Head className="bg-[#02235E] text-left text-white">
            <Table.Row className="h-[48px]">
              <Table.Heading className="w-[50px] pl-4">
                <Checkbox
                  onChange={handleTableHeadingCheckboxChange}
                  checked={isTableHeadingSelected()}
                />
              </Table.Heading>

              {data.columns?.map((column) => (
                <Table.Heading
                  className={twMerge("px-2")}
                  key={column.id}
                  dataKey={column.dataKey}
                  isSortable={column.isSortable}
                  sortData={sortData}
                  style={{ width: column.width ?? "" }}
                >
                  {column.text}
                </Table.Heading>
              ))}

              <Table.Heading className="w-[100px] pl-4">Action</Table.Heading>
            </Table.Row>
          </Table.Head>

          <Table.Body>
            {currentData?.map((datum, idx) => (
              <Table.Row
                key={idx}
                className="border-b border-b-[#605E5E] bg-white"
              >
                <Table.Column className="px-4 py-2">
                  <Checkbox
                    onChange={() => handleTableDataCheckboxChange(datum)}
                    checked={isTableDataSelected(datum)} // Check if current row data is selected
                  />
                </Table.Column>

                <Table.Column className="px-2">{datum.name}</Table.Column>

                <Table.Column className="overflow-hidden p-2">
                  <span className="line-clamp-1">{datum.description}</span>
                </Table.Column>

                <Table.Column className="p-2">
                  <span
                    className={twMerge(
                      "rounded-full px-2 py-1 text-white",
                      datum.status === "disabled" ? "bg-red-500" : "bg-green-600",
                    )}
                  >
                    {datum.status === "enabled" ? "Enabled" : "Disabled"}
                  </span>
                </Table.Column>

                <Table.Column className="p-2">
                  <ContextMenu
                    className="relative"
                    tableRef={tableRef}
                    contextMenuRef={contextMenuRef}
                  >
                    <ContextMenu.Trigger>
                      <FontAwesomeIcon
                        icon={faEllipsisVertical}
                        className="fa-fw"
                      />
                    </ContextMenu.Trigger>

                    <ContextMenu.Menu
                      className="absolute z-10 w-[175px] space-y-1 text-white"
                      contextMenuRef={contextMenuRef}
                    >
                      <ContextMenu.Item
                        className="rounded-md bg-[#0000CC]"
                        onClick={() => router.push("/product-types/single-product-type")}
                      >
                        View
                      </ContextMenu.Item>

                      <ContextMenu.Item
                        className="rounded-md bg-[#0000CC]"
                        onClick={() => router.push(`/product-types/${datum._id}/edit`)}
                      >
                        Edit
                      </ContextMenu.Item>

                      <ContextMenu.Item
                        className="rounded-md bg-[#0000CC]"
                        onClick={() => handleChangeStatus(datum._id, datum.status)} // Call handleChangeStatus
                      >
                        ChangeStatus
                      </ContextMenu.Item>

                      <ContextMenu.Item
                        className="rounded-md bg-[#0000CC]"
                        onClick={() => {}}
                      >
                        Blockchain View
                      </ContextMenu.Item>
                    </ContextMenu.Menu>
                  </ContextMenu>
                </Table.Column>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>

      <div className="text-right">
        <Pagination
          totalNumberOfData={data?.data?.length || 0}
          numberofDataPerPage={numberofDataPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  )
}
