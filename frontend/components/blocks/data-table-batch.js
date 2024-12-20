"use client"
import React, { useRef, useEffect, useState } from "react"
import Table from "./table"
import { twMerge } from "tailwind-merge"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons"
import Pagination from "../composites/pagination"
import Checkbox from "../elements/checkbox"
import ContextMenu from "./context-menu"
import axios from "axios"
import { useBatch } from "@/contexts/batch-context"
import { getCurrentUser } from "@/contexts/query-provider/api-request-functions/api-requests"
import { Modal } from "../elements/Modal"
import toast from "react-hot-toast"
import ImgWithWrapper from "../composites/img-with-wrapper"
import Button from "../elements/button"

export default function DataTable() {
  const tableRef = useRef()
  const contextMenuRef = useRef()
  const [userRole, setUserRole] = useState("")
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState(null)
  const [dataState, setDataState] = useState({ columns: [], data: [] }) // Local state for table data
  const { data, sortData, selectedData, setSelectedData, filters, setFilters, dataLoading } = useBatch()
  const [saving, setSaving] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const filteredData = data?.data || []

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await getCurrentUser()
        setUserRole(user.data.userType)
      } catch (error) {
        console.error("Error fetching current user:", error)
      }
    }

    fetchCurrentUser()
  }, [])

  // Sync local data state with the context data on initial load
  useEffect(() => {
    if (data) {
      setDataState(data) // Ensure the local state is updated when `data` from context changes
    }
  }, [data])

  useEffect(() => {
    setFilters((prevFilters) => ({ ...prevFilters, page: currentPage }))
  }, [currentPage])
  const isTableDataSelected = (dataToVerify) => {
    return selectedData.some((eachSelected) => eachSelected.batchId === dataToVerify.batchId)
  }

  const isTableHeadingSelected = () => {
    return dataState.data.every((datum) => selectedData.some((eachSelected) => eachSelected.batchId === datum.batchId))
  }

  const handleTableHeadingCheckboxChange = () => {
    setSelectedData((prev) =>
      prev.length > 0 ? (prev.length < dataState.data.length ? [...dataState.data] : []) : [...dataState.data],
    )
  }

  const handleTableDataCheckboxChange = (clickedData) => {
    setSelectedData((prev) =>
      isTableDataSelected(clickedData)
        ? prev.filter((eachPrev) => eachPrev.batchId !== clickedData.batchId)
        : [...prev, clickedData],
    )
  }

  const handleEditClick = (batch) => {
    setSelectedBatch(batch)
    setIsEditModalOpen(true)
  }

  const handleBatchUpdate = async (updatedData) => {
    if (!selectedBatch) {
      toast.error("No batch selected for update.")
      return
    }
    setSaving(true)

    try {
      const accessToken = localStorage.getItem("accessToken")
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/batch/editBatchId?batchId=${selectedBatch.id}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )

      if (response.status === 200) {
        toast.success("Batch updated successfully!")

        const updatedBatch = response.data.data

        setDataState((prevState) => ({
          ...prevState,
          data: prevState.data.map((batch) => (batch._id === updatedBatch._id ? updatedBatch : batch)),
        }))

        setIsEditModalOpen(false)
        setSelectedBatch(null)
        setSelectedData([])
        window.location.reload()
      } else {
        toast.error("Unexpected response from the server.")
      }
    } catch (error) {
      console.error("Error updating batch:", error)
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message) // Display the backend error message
      } else {
        toast.error("Failed to update the batch. Please try again.") // Fallback error message
      }
    } finally {
      setSaving(false)
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
              <Table.Heading
                className="pl-4"
                style={{ width: "50px" }}
              >
                <Checkbox
                  onChange={handleTableHeadingCheckboxChange}
                  checked={isTableHeadingSelected()}
                />
              </Table.Heading>
              {dataState.columns?.map((column) => (
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
            {dataLoading ? (
              <Table.Row>
                <Table.Column
                  colSpan={data.columns?.length + 2}
                  className="py-8 text-center"
                >
                  <div className="inline-block size-8 animate-spin border-4 border-black" />
                </Table.Column>
              </Table.Row>
            ) : (
              filteredData?.map((datum, idx) => (
                <Table.Row
                  key={idx}
                  className="border-b border-b-[#605E5E] bg-white"
                >
                  <Table.Column className="px-4 py-2">
                    <Checkbox
                      onChange={() => handleTableDataCheckboxChange(datum)}
                      checked={isTableDataSelected(datum)}
                    />
                  </Table.Column>
                  <Table.Column className="px-8">
                    <ImgWithWrapper
                      wrapperClassName="size-10 mx-15"
                      imageClassName="object-contain object-left"
                      imageAttributes={{
                        src:
                          datum?.blockChainVerified === "unverified"
                            ? "/assets/Unverified.png"
                            : datum?.blockChainVerified
                              ? "/assets/Verified2.png"
                              : "/assets/pending.png",
                        alt:
                          datum?.blockChainVerified === "unverified"
                            ? "Unverified Logo"
                            : datum?.blockChainVerified
                              ? "Verified Logo"
                              : "Unverified Logo",
                      }}
                    />
                  </Table.Column>
                  <Table.Column className="px-2">{datum.batchId} </Table.Column>
                  <Table.Column className="p-2">
                    {new Date(datum.createdAt).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                      second: "numeric",
                      hour12: true,
                    })}
                  </Table.Column>
                  <Table.Column className="p-2">
                    {datum.startDate
                      ? new Date(datum.startDate).toLocaleString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                          second: "numeric",
                          hour12: true,
                        })
                      : "N/A"}
                  </Table.Column>
                  <Table.Column className="p-2">
                    {datum.endDate
                      ? new Date(datum.endDate).toLocaleString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                          second: "numeric",
                          hour12: true,
                        })
                      : "N/A"}
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
                          onClick={() => handleEditClick(datum)}
                        >
                          Edit
                        </ContextMenu.Item>
                      </ContextMenu.Menu>
                    </ContextMenu>
                  </Table.Column>
                </Table.Row>
              ))
            )}
          </Table.Body>
        </Table>
      </div>
      <div className="text-right">
        <Pagination
          totalNumberOfData={data?.pagination?.totalItems || 0}
          numberOfDataPerPage={filters.limit}
          currentPage={currentPage}
          onPageChange={(newPage) => setCurrentPage(newPage)}
        />
      </div>
      {isEditModalOpen && selectedBatch && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Batch"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              const updatedData = Object.fromEntries(formData.entries())
              handleBatchUpdate(updatedData)
            }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">Batch ID</label>
              <input
                name="batchId"
                defaultValue={selectedBatch?.batchId || ""}
                className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-50"
                placeholder="Enter Batch ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                name="startDate"
                defaultValue={selectedBatch?.startDate?.slice(0, 10) || ""}
                className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                name="endDate"
                defaultValue={selectedBatch?.endDate?.slice(0, 10) || ""}
                className="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-300 focus:ring-opacity-50"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-200 focus:outline-none focus:ring focus:ring-gray-300 focus:ring-opacity-50"
              >
                Cancel
              </button>
              <div>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-[#02235E] px-8 py-2 text-white"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
