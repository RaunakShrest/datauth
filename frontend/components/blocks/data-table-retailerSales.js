"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { useRetailerSales } from "@/contexts/retailerSales-context"
import Table from "./table"
import ContextMenu from "./context-menu"
import Pagination from "../composites/pagination"
import Checkbox from "../elements/checkbox"
import { twMerge } from "tailwind-merge"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons"
import { useDebounce } from "@/utils/debounce"
import ImgWithWrapper from "../composites/img-with-wrapper"
const convertToCSV = (data) => {
  const header = [
    "Customer Name",
    "Email",
    "Phone Number",
    "Product Name",
    "Product Price",
    "Batch ID",
    "Manufacturer",
    "Product Attributes",
    "Sold Date",
  ]
  const rows = data.map((datum) => {
    const attributes = datum.soldProducts?.productAttributes
      ? datum.soldProducts.productAttributes.map((attr) => `${attr.attributeName}: ${attr.attributeValue}`).join("; ")
      : "N/A"

    return [
      datum.name,
      datum.email,
      datum.phoneNumber,
      datum.soldProducts?.productManufacturer?.companyName || "N/A",
      datum.soldProducts?.productName || "N/A",
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
const downloadCSV = (csvContent, fileName = "Retailer_Sales.csv") => {
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
  const { data, sortData, selectedData, setSelectedData, fetchRetailerSales, userRole, filters, setFilters } =
    useRetailerSales()

  const [hasFetched, setHasFetched] = useState(false)

  const [searchCustomerName, setSearchCustomerName] = useState("")
  const [searchCompanyName, setSearchCompanyName] = useState("")
  const [searchProductName, setSearchProductName] = useState("")
  const [searchRetalerName, setSearchRetailerName] = useState("")

  const initialStartDate = new Date()
  initialStartDate.setMonth(initialStartDate.getMonth() - 1) // Set to one month before today
  const initialEndDate = new Date()
  const [startDate, setStartDate] = useState(initialStartDate.toISOString().split("T")[0])
  const [endDate, setEndDate] = useState(initialEndDate.toISOString().split("T")[0])
  const [currentPage, setCurrentPage] = useState(1)
  const filteredData = data?.data?.customerInfo
  const fetchSalesData = useCallback(() => {
    if (!hasFetched) {
      // fetchRetailerSales()
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

  useEffect(() => {
    setFilters({ ...filters, page: currentPage })
  }, [currentPage])

  const debouncedSearchCustomerName = useDebounce({ searchValue: searchCustomerName })
  const debouncedSearchCompanyName = useDebounce({ searchValue: searchCompanyName })
  const debouncedSearchProducName = useDebounce({ searchValue: searchProductName })
  const debouncedSearchRetailerName = useDebounce({ searchValue: searchRetalerName })

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      customerNameSearch: `${debouncedSearchCustomerName} `.trim(),
    }))
  }, [debouncedSearchCustomerName])
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      productNameSearch: ` ${debouncedSearchProducName}`.trim(),
    }))
  }, [debouncedSearchProducName])
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      retailerNameSearch: `${debouncedSearchRetailerName} `.trim(),
    }))
  }, [debouncedSearchRetailerName])
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      companyNameSearch: debouncedSearchCompanyName.trim(),
    }))
  }, [debouncedSearchCompanyName])

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

  const handleReset = () => {
    window.location.reload()
  }
  const handleDownloadCSV = () => {
    const csvContent = convertToCSV(selectedData)
    downloadCSV(csvContent)
  }

  return (
    <div className="space-y-4">
      <div className="flex w-full flex-row flex-wrap justify-between">
        <div className="w-8/10 flex flex-wrap justify-between">
          <div className="m-2">
            <input
              type="text"
              placeholder="Search by Retailer Name"
              value={searchRetalerName}
              onChange={(e) => setSearchRetailerName(e.target.value)}
              className="rounded-md border border-gray-600 p-2"
            />
          </div>
          <div className="m-2">
            <input
              type="text"
              placeholder="Search by Product name"
              value={searchProductName}
              onChange={(e) => setSearchProductName(e.target.value)}
              className="rounded-md border border-gray-600 p-2"
            />
          </div>
          <div className="m-2">
            <input
              type="text"
              placeholder="Search by Customer name"
              value={searchCustomerName}
              onChange={(e) => setSearchCustomerName(e.target.value)}
              className="rounded-md border border-gray-600 p-2"
            />
          </div>
          <div className="m-2">
            <input
              type="text"
              placeholder="Search by Company name"
              value={searchCompanyName}
              onChange={(e) => setSearchCompanyName(e.target.value)}
              className="rounded-md border border-gray-600 p-2"
            />
          </div>
        </div>
        <div className="flex flex-wrap">
          <div className="m-2">
            Start
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="rounded border p-2"
            />
          </div>
          <div className="m-2">
            End
            <input
              type="date"
              value={endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="rounded border p-2"
            />
          </div>
          <button
            onClick={handleReset}
            className="ml-3 mt-2 rounded-md bg-red-500 px-4 py-2 text-white lg:mt-0"
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
            {filteredData?.map((datum, idx) => (
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
                {userRole === "super-admin" && (
                  <Table.Column className="p-2">
                    <span>{datum.soldBy?.companyName || "N/A"}</span>
                  </Table.Column>
                )}
                <Table.Column className="px-2">{datum.name}</Table.Column>
                <Table.Column className="px-2">{datum.email}</Table.Column>
                <Table.Column className="overflow-hidden p-2">
                  <span className="line-clamp-1">{datum.phoneNumber}</span>
                </Table.Column>
                <Table.Column className="p-2">
                  <span>{datum?.productManufacturer?.companyName || "N/A"}</span>
                </Table.Column>
                <Table.Column className="p-2">
                  <span>{datum.soldProducts?.productName || "N/A"}</span>
                </Table.Column>

                <Table.Column className="p-2">
                  <span>{datum.soldProducts?.productPrice || "N/A"}</span>
                </Table.Column>
                <Table.Column className="p-2">
                  <span>{datum.batchId?.batchId || "N/A"}</span>
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
                    ></ContextMenu.Menu>
                  </ContextMenu>
                </Table.Column>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>

      <div className="text-right">
        <Pagination
          totalNumberOfData={data?.data?.pagination?.totalItems || 0}
          numberOfDataPerPage={filters.limit}
          currentPage={currentPage}
          onPageChange={(newPage) => setCurrentPage(newPage)}
        />
      </div>
    </div>
  )
}
