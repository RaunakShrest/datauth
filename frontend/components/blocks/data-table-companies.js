import React, { useRef, useEffect, useState } from "react"
import Table from "./table"
import { twMerge } from "tailwind-merge"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons"
import { useCompanies } from "@/contexts/companies-context"
import Pagination from "../composites/pagination"
import Checkbox from "../elements/checkbox"
import ContextMenu from "./context-menu"
import { useRouter } from "next/navigation"
import axios from "axios"
import { getCurrentUser } from "@/contexts/query-provider/api-request-functions/api-requests"

const DisableModal = ({ isOpen, onClose, onSubmit, company }) => {
  const [remarks, setRemarks] = useState("")

  const handleDisableSubmit = () => {
    onSubmit(company, remarks)
    setRemarks("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-[30rem] rounded-md bg-white p-6 shadow-lg">
        {/* Increased width and padding */}
        <h2 className="text-lg font-bold">Disable Company</h2>
        <p className="mt-2">Please provide a reason for disabling the company:</p>
        <textarea
          className="mt-2 w-full rounded-md border p-2"
          rows="8"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          required
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
  const tableRef = useRef()
  const contextMenuRef = useRef()
  const [userRole, setUserRole] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false) // Modal state
  const [companyToDisable, setCompanyToDisable] = useState(null) // Track which company to disable

  const { data, sortData, selectedData, setSelectedData, fetchCompanies } = useCompanies() // Added fetchData

  const [currentPage, setCurrentPage] = useState(1)

  const numberOfDataPerPage = 8
  const indexOfLastData = currentPage * numberOfDataPerPage
  const indexOfFirstData = indexOfLastData - numberOfDataPerPage

  const currentData = data?.data?.slice(indexOfFirstData, indexOfLastData) || []

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await getCurrentUser() // Assuming this returns an object with user details
        setUserRole(user.data.userType) // Set the user role (e.g., "retailer", "super-admin", etc.)
      } catch (error) {
        console.error("Error fetching current user:", error)
      }
    }

    fetchCurrentUser()
  }, [])
  const isTableDataSelected = (dataToVerify) => {
    return selectedData.some((eachSelected) => eachSelected.companyName === dataToVerify.companyName)
  }

  const isTableHeadingSelected = () => {
    return data.data?.every((datum) =>
      selectedData.some((eachSelected) => eachSelected.companyName === datum.companyName),
    )
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

  const handleApprove = async (company) => {
    const updatedCompany = { ...company, status: "enabled" }

    try {
      await updateCompanyStatus(company._id, updatedCompany) // Use _id instead of id
      await fetchCompanies()
    } catch (error) {
      console.error("Failed to approve company:", error)
    }
  }
  const handleDisable = (company) => {
    setCompanyToDisable(company)
    setIsModalOpen(true) // Open modal
  }
  const handleSubmitDisable = async (company, remarks) => {
    const updatedCompany = { ...company, status: "disabled", remarks }

    try {
      await updateCompanyStatus(company._id, updatedCompany)
      await fetchCompanies()
    } catch (error) {
      console.error("Failed to disable company:", error)
    }
  }
  const updateCompanyStatus = async (id, updatedCompany) => {
    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/users/get-companies/${id}`,
        updatedCompany,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )

      return response.data
    } catch (error) {
      console.error("Error updating company status:", error.response?.data || error.message)
      throw new Error("Failed to update company status")
    }
  }
  const handleDelete = async (companyId) => {
    if (window.confirm("Are you sure you want to delete this company?")) {
      try {
        await deleteCompany(companyId)
        await fetchCompanies()
      } catch (error) {
        console.error("Failed to delete company:", error)
      }
    }
  }

  const deleteCompany = async (id) => {
    try {
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL_DEV}/users/delete-company/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      return response.data
    } catch (error) {
      console.error("Error deleting company:", error.response?.data || error.message)
      throw new Error("Failed to delete company")
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
                <Table.Column className="overflow-hidden p-2">
                  <span className="line-clamp-1">{datum.productType.join(", ")}</span>
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
                  {new Date(datum.createdAt).toLocaleString("eng-US", {
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
                        className="rounded-md bg-[#017082]"
                        onClick={() => router.push("/companies/single-company")}
                      >
                        View
                      </ContextMenu.Item>
                      {userRole !== "retailer" && (
                        <>
                          <ContextMenu.Item
                            className="rounded-md bg-[#017082]"
                            // onClick={() => router.push("/companies/edit-company")}
                            onClick={() => router.push(`/companies/${datum._id}/edit`)}
                          >
                            Edit
                          </ContextMenu.Item>
                          <ContextMenu.Item
                            className="rounded-md bg-[#017082]"
                            onClick={() => handleDelete(datum._id)}
                          >
                            Delete
                          </ContextMenu.Item>
                          <ContextMenu.Item
                            className="rounded-md bg-[#017082]"
                            onClick={() => handleApprove(datum)}
                          >
                            Approve
                          </ContextMenu.Item>
                          <ContextMenu.Item
                            className="rounded-md bg-[#017082]"
                            onClick={() => handleDisable(datum)}
                          >
                            Disable
                          </ContextMenu.Item>
                        </>
                      )}
                      <ContextMenu.Item
                        className="rounded-md bg-[#017082]"
                        onClick={() => router.push(`/companies/${datum._id}/products`)}
                      >
                        View Products
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
        onClose={() => setIsModalOpen(false)} // Close modal handler
        onSubmit={handleSubmitDisable} // Submit handler
        company={companyToDisable} // Pass the selected company to disable
      />
    </div>
  )
}
