"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import Table from "./table"
import ContextMenu from "./context-menu"
import Pagination from "../composites/pagination"
import Checkbox from "../elements/checkbox"
import { twMerge } from "tailwind-merge"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons"
import { useCompanySales } from "@/contexts/companySales-context"

const convertToCSV = (data) => {
  const header = [
    "Company Name",
    "Customer Name",
    "Product Name",
    "Retailer Name",
    "Product Price",
    "Batch ID",
    "Product Attributes",
    "Sold Date",
  ]
  const rows = data.map((datum) => {
    const attributes = datum.soldProducts?.productAttributes
      ? datum.soldProducts.productAttributes.map((attr) => `${attr.attributeName}: ${attr.attributeValue}`).join("; ")
      : "N/A"

    return [
      datum.soldBy?.companyName,
      datum.name,
      datum.soldProducts?.productName || "N/A",
      datum.soldBy?.companyName || "N/A",
      datum.soldProducts?.productPrice || "N/A",
      datum.soldProducts?.batchId || "N/A",
      attributes,
      datum.soldProducts?.createdAt,
    ]
  })

  const csvContent = [header.join(","), ...rows.map((row) => row.join(","))].join("\n")

  return csvContent
}

// Helper function to download CSV file
const downloadCSV = (csvContent, fileName = "Company_Sales.csv") => {
  const blob = new Blob([csvContent], { type: "text/csv" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", fileName)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export default function DataTable() {
  const tableRef = useRef()
  const contextMenuRef = useRef()
  const { data, sortData, selectedData, setSelectedData, fetchCompanySales, userRole } = useCompanySales()

  const numberOfDataPerPage = 8
  const [hasFetched, setHasFetched] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchBatchId, setSearchBatchId] = useState("")
  const [searchRetailerName, setSearchRetailerName] = useState("")
  const [searchProductName, setSearchProductName] = useState("")
  const initialStartDate = new Date()
  initialStartDate.setMonth(initialStartDate.getMonth() - 1) // Set to one month before today
  const initialEndDate = new Date()
  const [startDate, setStartDate] = useState(initialStartDate.toISOString().split("T")[0])
  const [endDate, setEndDate] = useState(initialEndDate.toISOString().split("T")[0])
  const indexOfLastData = currentPage * numberOfDataPerPage
  const indexOfFirstData = indexOfLastData - numberOfDataPerPage

  const fetchSalesData = useCallback(() => {
    if (!hasFetched) {
      // fetchCompanySales()
      setHasFetched(true)
    }
  }, [hasFetched])

  const handleTableHeadingCheckboxChange = () => {
    setSelectedData((prev) =>
      prev.length > 0 ? (prev.length < data?.data.length ? [...data?.data] : []) : [...data?.data],
    )
  }

  useEffect(() => {
    fetchSalesData() // Fetch sales data on mount
  }, [fetchSalesData])

  const handleTableDataCheckboxChange = (clickedData) => {
    setSelectedData((prev) =>
      isTableDataSelected(clickedData)
        ? prev.filter((eachPrev) => eachPrev.name !== clickedData.name)
        : [...prev, clickedData],
    )
  }

  const isTableHeadingSelected = () => {
    return selectedData.length === data?.data?.length
  }

  const isTableDataSelected = (datum) => {
    return selectedData.some((selected) => selected.name === datum.name)
  }
  // Adjusted Filtering Logic in DataTable Component
  const filteredData =
    data?.data?.filter((datum) => {
      const createdAt = new Date(datum?.createdAt)
      const isWithinDateRange =
        (!startDate || createdAt >= new Date(startDate)) &&
        (!endDate || createdAt < new Date(new Date(endDate).setHours(24, 0, 0, 0))) // Adjust end date to include entire day

      return (
        datum.soldProducts?.batchId.toLowerCase().includes(searchBatchId.toLowerCase()) &&
        datum.soldBy?.companyName.toLowerCase().includes(searchRetailerName.toLowerCase()) &&
        datum.soldProducts?.productName.toLowerCase().includes(searchProductName.toLowerCase()) &&
        isWithinDateRange
      )
    }) || []

  const currentData = filteredData.slice(indexOfFirstData, indexOfLastData)

  const handleReset = () => {
    setSearchBatchId("")
    setSearchRetailerName("")
    setSearchProductName("")
    setStartDate(initialStartDate.toISOString().split("T")[0]) // Reset to initial start date
    setEndDate(initialEndDate.toISOString().split("T")[0]) // Reset to initial end date
  }
  const handleDownloadCSV = () => {
    const csvContent = convertToCSV(selectedData)
    downloadCSV(csvContent)
  }

  return (
    <div className="space-y-4">
      {/* Search Field */}
      <div className="flex justify-start">
        <div className="m-2 mb-6 flex items-start justify-between">
          <input
            type="text"
            placeholder="Search by Batch ID"
            value={searchBatchId}
            onChange={(e) => setSearchBatchId(e.target.value)}
            className="w-80 rounded-md border border-gray-600 p-2"
          />
        </div>
        <div className="m-2 mb-6 flex items-start justify-between">
          <input
            type="text"
            placeholder="Search by Retailer name"
            value={searchRetailerName}
            onChange={(e) => setSearchRetailerName(e.target.value)}
            className="w-80 rounded-md border border-gray-600 p-2"
          />
        </div>
        <div className="m-2 mb-6 flex items-start justify-between">
          <input
            type="text"
            placeholder="Search by Product name"
            value={searchProductName}
            onChange={(e) => setSearchProductName(e.target.value)}
            className="w-80 rounded-md border border-gray-600 p-2"
          />
        </div>
        <div className="ml-auto flex items-center space-x-2">
          <div>
            Start
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded border p-2"
            />
            End
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="ml-2 rounded border p-2"
            />
          </div>
          <button
            onClick={handleReset}
            className="ml-3 rounded-md bg-red-500 px-2 py-4 text-white"
          >
            Reset
          </button>
        </div>
      </div>
      {selectedData.length > 0 && (
        <button
          onClick={handleDownloadCSV}
          className="ml-2 mt-2 rounded-md bg-blue-500 px-4 py-2 text-white"
        >
          Download CSV
        </button>
      )}
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

              {data?.columns?.map((column) => (
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
            {currentData.map((datum, idx) => (
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
                {userRole === "super-admin" && (
                  <Table.Column className="px-2">{datum.soldBy?.companyName}</Table.Column>
                )}

                <Table.Column className="px-2">{datum.name}</Table.Column>
                <Table.Column className="px-2">{datum.soldProducts?.productName}</Table.Column>
                <Table.Column className="overflow-hidden p-2">
                  <span className="line-clamp-1">{datum.soldBy?.companyName}</span>
                </Table.Column>

                <Table.Column className="p-2">
                  <span>{datum.soldProducts?.productPrice || "N/A"}</span>
                </Table.Column>
                <Table.Column className="p-2">
                  <span>{datum.soldProducts?.batchId || "N/A"}</span>
                </Table.Column>
                <Table.Column className="p-2">
                  {new Date(datum?.createdAt).toLocaleString("en-US", {
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
                      {/* <ContextMenu.Item
                        className="rounded-md bg-[#017082]"
                        onClick={() => {}}
                      >
                        View
                      </ContextMenu.Item>
                      <ContextMenu.Item
                        className="rounded-md bg-[#017082]"
                        onClick={() => {}}
                      >
                        Edit
                      </ContextMenu.Item> */}
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
    </div>
  )
}
