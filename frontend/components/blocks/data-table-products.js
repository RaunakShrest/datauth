"use client"

import { useRouter } from "next/navigation"
import React, { useRef, useState } from "react"
import Table from "./table"
import ContextMenu from "./context-menu"
import Pagination from "../composites/pagination"
import Checkbox from "../elements/checkbox"
import { twMerge } from "tailwind-merge"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons"
import { useProducts } from "@/contexts/products-context"
import ImgWithWrapper from "../composites/img-with-wrapper"

export default function DataTable() {
  const router = useRouter()

  const tableRef = useRef()
  const contextMenuRef = useRef()

  const { products, columns, sortData, selectedData, setSelectedData } = useProducts()

  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)  // Add currentPage state
  const numberOfDataPerPage = 8

  // Filter products based on batchId search
  const filteredProducts = products.filter((product) => {
    return product.batchId?.batchId.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Paginate the filtered products
  const indexOfLastData = currentPage * numberOfDataPerPage
  const indexOfFirstData = indexOfLastData - numberOfDataPerPage
  const currentData = filteredProducts.slice(indexOfFirstData, indexOfLastData)

  const isTableDataSelected = (dataToVerify) => {
    return selectedData.some((eachSelected) => eachSelected._id === dataToVerify._id)
  }

  const isTableHeadingSelected = () => {
    const isAllDataSelected = products?.every((datum) =>
      selectedData.some((eachSelected) => eachSelected._id === datum._id),
    )

    return isAllDataSelected
  }

  const handleTableHeadingCheckboxChange = () => {
    setSelectedData((prev) =>
      prev.length > 0 ? (prev.length < products.length ? [...products] : []) : [...products],
    )
  }

  const handleTableDataCheckboxChange = (clickedData) => {
    setSelectedData((prev) =>
      isTableDataSelected(clickedData)
        ? prev.filter((eachPrev) => eachPrev._id !== clickedData._id)
        : [...prev, clickedData],
    )
  }

  const handlePrint = () => {
  const printWindow = window.open("", "_blank");
  const printableContent = selectedData
    .map(
      (item, index) => `
        <div style="margin-bottom: 20px;">
          <img src="${item.qrUrl}" alt="QR Code" style="width: 150px; height: 150px;"/>
          <p>SKU: ${item.productSku}</p>
        </div>
        ${index < selectedData.length - 1 ? '<hr style="border: 1px solid #000; margin: 20px 0;" />' : ''}
      `
    )
    .join("");

  printWindow.document.write(`
    <html>
      <head>
        <title>Print QR and SKU</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          img {
            display: block;
            margin-bottom: 10px;
          }
          p {
            font-size: 16px;
          }
          hr {
            border: 1px solid #000;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        ${printableContent}
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.print();
};


  return (
    <div className="space-y-4">
      {/* Search Field and Print Button in the Same Row */}
      <div className="mb-6 flex items-start justify-between">
        <input
          type="text"
          placeholder="Search by Batch ID"
          className="w-80 p-2 border border-gray-600 rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Print Button */}
        <button
          onClick={handlePrint}
          disabled={selectedData.length === 0}
          className={twMerge(
            "bg-[#017082] text-white px-4 py-2 rounded-md ml-4",
            selectedData.length === 0 ? "opacity-50 cursor-not-allowed" : ""
          )}
        >
          Print Selected QR
        </button>
      </div>

      <div className="overflow-x-auto">
        <Table className="w-full table-fixed border-collapse" tableRef={tableRef}>
          <Table.Head className="bg-[#017082] text-left text-white">
            <Table.Row className="h-16">
              <Table.Heading className="pl-4" style={{ width: "50px" }}>
                <Checkbox onChange={handleTableHeadingCheckboxChange} checked={isTableHeadingSelected()} />
              </Table.Heading>

              {columns?.map((column) => (
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

              <Table.Heading className="pl-4" style={{ width: "5rem" }}>
                Action
              </Table.Heading>
            </Table.Row>
          </Table.Head>

          <Table.Body>
            {currentData?.map((datum, idx) => (
              <Table.Row key={idx} className={twMerge((idx + 1) % 2 !== 0 ? "bg-white" : "")}>
                <Table.Column className="px-4 py-2">
                  <Checkbox
                    onChange={() => handleTableDataCheckboxChange(datum)}
                    checked={isTableDataSelected(datum)}
                  />
                </Table.Column>

                <Table.Column className="px-2">{datum.productName}</Table.Column>
                <Table.Column className="px-2">{datum.productManufacturer.companyName}</Table.Column>
                <Table.Column className="p-2">{datum.productPrice}</Table.Column>

                <Table.Column className="p-2">{datum.productSku}</Table.Column>

                <Table.Column className="p-2">{datum.batchId?.batchId}</Table.Column>

                <Table.Column className="p-2">{datum.productStatus}</Table.Column>
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
                  <a href={datum.qrUrl} target="_blank" rel="noopener noreferrer">
                    <ImgWithWrapper
                      wrapperClassName="size-10 mx-auto"
                      imageAttributes={{ src: datum.qrUrl, alt: "product-qr" }}
                    />
                  </a>
                </Table.Column>

                <Table.Column className="p-2">
                  <ContextMenu className="relative" tableRef={tableRef} contextMenuRef={contextMenuRef}>
                    <ContextMenu.Trigger>
                      <FontAwesomeIcon icon={faEllipsisVertical} className="fa-fw" />
                    </ContextMenu.Trigger>

                    <ContextMenu.Menu
                      className="absolute z-10 w-[175px] space-y-1 bg-white/80 p-2 text-white"
                      contextMenuRef={contextMenuRef}
                    >
                      <ContextMenu.Item
                        className="rounded-md bg-[#017082]"
                        onClick={() => router.push(`/products/${datum.slug}`)}
                      >
                        View
                      </ContextMenu.Item>

                      <ContextMenu.Item
                        className="rounded-md bg-[#017082]"
                        onClick={() => router.push(`/products/${datum.slug}/edit`)}
                      >
                        Edit
                      </ContextMenu.Item>

                      <ContextMenu.Item className="rounded-md bg-[#017082]" onClick={() => null}>
                        Delete
                      </ContextMenu.Item>

                      <ContextMenu.Item className="rounded-md bg-[#017082]" onClick={() => {}}>
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
          totalNumberOfData={filteredProducts.length}
          numberOfDataPerPage={numberOfDataPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}  // handle page change
        />
      </div>
    </div>
  )
}
