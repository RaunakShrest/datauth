"use client"

import { useRetailers } from "@/contexts/retailers-context"
import { useRouter } from "next/navigation"
import React, { useRef, useState, useEffect } from "react"
import Table from "./table"
import ContextMenu from "./context-menu"
import Pagination from "../composites/pagination"
import Checkbox from "../elements/checkbox"
import { twMerge } from "tailwind-merge"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons"
import axios from "axios"
import ImgWithWrapper from "../composites/img-with-wrapper"

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

const ApprovalModal = ({ isOpen, onClose, onConfirm, loading }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-[20rem] rounded-md bg-white p-6 shadow-lg">
        <h2 className="text-lg font-bold">Approve Retailer</h2>
        <p className="mt-2">Do you want to approve this retailer?</p>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            className="rounded-md bg-red-600 px-4 py-2"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className={`rounded-md px-4 py-2 text-white ${loading ? "cursor-not-allowed bg-gray-400" : "bg-green-500"}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Loading..." : "Yes"}
          </button>
        </div>
      </div>
    </div>
  )
}
export default function DataTable() {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [retailerToDisable, setRetailerToDisable] = useState(null) // Track which company to disable
  const [retailerToApprove, setRetailerToApprove] = useState(null)
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false)
  const tableRef = useRef()
  const contextMenuRef = useRef()
  const [currentPage, setCurrentPage] = useState(1)

  const {
    data,
    sortData,
    selectedData,
    setSelectedData,
    fetchRetailers,
    userRole,
    filters,
    setFilters,
    loading,
    setLoading,
  } = useRetailers()

  const filteredData = data?.data || []

  const isTableDataSelected = (dataToVerify) => {
    return selectedData.some((eachSelected) => eachSelected.companyName === dataToVerify.companyName) ? true : false
  }
  useEffect(() => {
    setFilters((prevFilters) => ({ ...prevFilters, page: currentPage }))
  }, [currentPage])

  const isTableHeadingSelected = () => {
    // const isAllDataSelected = data.data?.retailers.every((datum) =>
    //   selectedData.some((eachSelected) => eachSelected.companyName === datum.companyName),
    // )
    // return isAllDataSelected
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
  const handleApprove = async () => {
    setLoading(true)
    const updatedRetailer = { ...retailerToApprove, status: "enabled" }
    try {
      await updateRetailerStatus(retailerToApprove.id, updatedRetailer)
      await fetchRetailers()
      setIsApprovalModalOpen(false)
    } catch (error) {
      console.error("Failed to approve retailer", error)
    } finally {
      setLoading(false)
    }
  }
  const handleDisable = (retailer) => {
    setRetailerToDisable(retailer)
    setIsModalOpen(true)
  }
  const handleSubmitDisable = async (retailer, remarks) => {
    const updatedRetailer = { ...retailer, status: "disabled", remarks }

    try {
      await updateRetailerStatus(retailer.id, updatedRetailer)
      await fetchRetailers()
    } catch (error) {
      console.error("Failed to disable retailer:", error)
    }
  }
  const updateRetailerStatus = async (id, updatedRetailer) => {
    try {
      const accessToken = localStorage.getItem("accessToken")
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/retailers/updateRetailerStatus/${id}`,
        updatedRetailer,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
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
            {loading ? (
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
                          datum?.blockChainVerified === "pending"
                            ? "/assets/Pending.png"
                            : datum?.blockChainVerified
                              ? "/assets/Verified2.png"
                              : "/assets/Unverified.png",
                        alt:
                          datum?.blockChainVerified === "pending"
                            ? "Pending Logo"
                            : datum?.blockChainVerified
                              ? "Verified Logo"
                              : "Unverified Logo",
                      }}
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
                          onClick={() => router.push(`/retailers/${datum.id}/edit`)}
                        >
                          Edit
                        </ContextMenu.Item>
                        {userRole === "super-admin" && (
                          <ContextMenu.Item
                            className="rounded-md bg-[#0000CC]"
                            onClick={() => {
                              setRetailerToApprove(datum)
                              setIsApprovalModalOpen(true)
                            }}
                          >
                            Approve
                          </ContextMenu.Item>
                        )}
                        {userRole === "super-admin" && (
                          <ContextMenu.Item
                            className="rounded-md bg-[#0000CC]"
                            onClick={() => handleDisable(datum)}
                          >
                            Disable
                          </ContextMenu.Item>
                        )}
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
      <DisableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitDisable}
        retailer={retailerToDisable}
      />
      <ApprovalModal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        onConfirm={handleApprove}
        loading={loading}
      />
    </div>
  )
}
