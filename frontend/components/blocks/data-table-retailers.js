"use client"

import { useRetailers } from "@/contexts/retailers-context"
import { useRouter } from "next/navigation"
import React, { useRef, useState } from "react"
import Table from "./table"
import ContextMenu from "./context-menu"
import Pagination from "../composites/pagination"
import Checkbox from "../elements/checkbox"
import { twMerge } from "tailwind-merge"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons"
import axios from "axios"

const DisableModal = ({ isOpen, onClose, onSubmit, retailer }) => {
  const [remarks, setRemarks] = useState("")

  const handleDisableSubmit = () => {
    onSubmit(retailer, remarks)
    setRemarks("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-[30rem] rounded-md bg-white p-6 shadow-lg">
        <h2 className="text-lg font-bold">Disable Retailer</h2>
        <p className="mt-2">Please provide a reason for disabling the retailer:</p>
        <textarea
          className="mt-2 w-full rounded-md border p-2"
          rows="8"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        ></textarea>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            className="rounded-md bg-gray-300 px-4 py-2"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="rounded-md bg-red-500 px-4 py-2 text-white"
            onClick={handleDisableSubmit}
          >
            Disable
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DataTable() {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false) // Modal state
  const [retailerToDisable, setRetailerToDisable] = useState(null) // Track which company to disable

  const tableRef = useRef()
  const contextMenuRef = useRef()
  const [currentPage, setCurrentPage] = useState(1)

  const { data, sortData, selectedData, setSelectedData, fetchRetailers, userRole } = useRetailers()

  const numberOfDataPerPage = 8
  const indexOfLastData = currentPage * numberOfDataPerPage
  const indexOfFirstData = indexOfLastData - numberOfDataPerPage

  const currentData = data?.data?.slice(indexOfFirstData, indexOfLastData) || []

  const isTableDataSelected = (dataToVerify) => {
    return selectedData.some((eachSelected) => eachSelected.companyName === dataToVerify.companyName) ? true : false
  }

  const isTableHeadingSelected = () => {
    const isAllDataSelected = data.data?.every((datum) =>
      selectedData.some((eachSelected) => eachSelected.companyName === datum.companyName),
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
        ? prev.filter((eachPrev) => eachPrev.companyName !== clickedData.companyName)
        : [...prev, clickedData],
    )
  }
  const handleApprove = async (retailer) => {
    const updatedRetailer = { ...retailer, status: "enabled" }
    try {
      await updateRetailerStatus(retailer._id, updatedRetailer)
      await fetchRetailers()
    } catch (error) {
      console.error("Failed to approve retailer", error)
    }
  }
  const handleDisable = (retailer) => {
    setRetailerToDisable(retailer)
    setIsModalOpen(true)
  }
  const handleSubmitDisable = async (retailer, remarks) => {
    const updatedRetailer = { ...retailer, status: "disabled", remarks }

    try {
      await updateRetailerStatus(retailer._id, updatedRetailer)
      await fetchRetailers()
    } catch (error) {
      console.error("Failed to disable retailer:", error)
    }
  }
  const updateRetailerStatus = async (id, updatedRetailer) => {
    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/retailers/updateRetailerStatus/${id}`,
        updatedRetailer,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
      return response.data
    } catch (error) {
      console.error("Error updating retailer status", error.response?.data || error.message)
      throw new Error("Failed to update retailer status")
    }
  }
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table
          className="w-full table-fixed border-collapse"
          tableRef={tableRef}
        >
          <Table.Head className="bg-[#017082] text-left text-white">
            <Table.Row className="h-16">
              <Table.Heading
                className="pl-4"
                style={{ width: "50px" }}
              >
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

              <Table.Heading
                className="pl-4"
                style={{ width: "100px" }}
              >
                Action
              </Table.Heading>
            </Table.Row>
          </Table.Head>

          <Table.Body>
            {currentData?.map((datum, idx) => (
              <Table.Row
                key={idx}
                className={twMerge((idx + 1) % 2 !== 0 ? "bg-white" : "")}
              >
                <Table.Column className="px-4 py-2">
                  <Checkbox
                    onChange={() => handleTableDataCheckboxChange(datum)}
                    checked={isTableDataSelected(datum)}
                  />
                </Table.Column>

                <Table.Column className="px-2">{datum.companyName}</Table.Column>

                <Table.Column className="p-2">
                  <span className="line-clamp-1">
                    {datum.firstName} {datum.lastName}
                  </span>
                </Table.Column>

                <Table.Column className="overflow-hidden p-2">
                  <span className="line-clamp-1">{datum.phoneNumber}</span>
                </Table.Column>

                <Table.Column className="overflow-hidden p-2">
                  <span className="line-clamp-1">{datum.email}</span>
                </Table.Column>

                <Table.Column className="p-2">
                  {" "}
                  <span
                    className={twMerge(
                      "rounded-full px-2 py-1 text-white",
                      datum.status === "disabled"
                        ? "bg-red-500"
                        : datum.status === "enabled"
                          ? "bg-green-600"
                          : "bg-gray-500",
                    )}
                  >
                    {datum.status}
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
                      {/* <ContextMenu.Item
                        className="rounded-md bg-[#017082]"
                        onClick={() => router.push("/retailers/single-retailer")}
                      >
                        View
                      </ContextMenu.Item> */}

                      <ContextMenu.Item
                        className="rounded-md bg-[#017082]"
                        onClick={() => router.push(`/retailers/${datum._id}/edit`)}
                      >
                        Edit
                      </ContextMenu.Item>
                      {userRole === "super-admin" && (
                        <ContextMenu.Item
                          className="rounded-md bg-[#017082]"
                          onClick={() => handleApprove(datum)}
                        >
                          Approve
                        </ContextMenu.Item>
                      )}
                      {userRole === "super-admin" && (
                        <ContextMenu.Item
                          className="rounded-md bg-[#017082]"
                          onClick={() => handleDisable(datum)}
                        >
                          Disable
                        </ContextMenu.Item>
                      )}
                      <ContextMenu.Item
                        className="rounded-md bg-[#017082]"
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
          numberOfDataPerPage={numberOfDataPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
      <DisableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitDisable}
        retailer={retailerToDisable}
      />
    </div>
  )
}
