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

  // Filter products based on batchId search
  const filteredProducts = products.filter((product) => {
    return product.batchId?.batchId.toLowerCase().includes(searchTerm.toLowerCase())
  })

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
    setSelectedData((prev) => (prev.length > 0 ? (prev.length < products.length ? [...products] : []) : [...products]))
  }

  const handleTableDataCheckboxChange = (clickedData) => {
    setSelectedData((prev) =>
      isTableDataSelected(clickedData)
        ? prev.filter((eachPrev) => eachPrev._id !== clickedData._id)
        : [...prev, clickedData],
    )
  }

  const handlePrint = () => {
    // Create a new printable window
    const printWindow = window.open("", "_blank")
    
    // Generate the printable content
    const printableContent = selectedData.map((item) => {
      return `
        <div style="margin-bottom: 20px;">
          <img src="${item.qrUrl}" alt="QR Code" style="width: 150px; height: 150px;"/>
          <p>SKU: ${item.productSku}</p>
        </div>
      `
    }).join("")

    // Write the HTML for the printable content
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
          </style>
        </head>
        <body>
          ${printableContent}
        </body>
      </html>
    `)

    // Close the document and trigger the print dialog
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="space-y-4">
      {/* Search Field */}
      <div className="mb-6 flex items-start">
        <input
          type="text"
          placeholder="Search by Batch ID"
          className="w-80 p-2 border border-gray-600 rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Conditionally render the print button when items are selected */}
      {selectedData.length > 0 && (
        <div className="flex justify-end mb-4">
          <button
            onClick={handlePrint}
            className="bg-[#017082]  text-white px-4 py-2 rounded-md"
          >
            Print Selected
          </button>
        </div>
      )}

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
            {filteredProducts?.map((datum, idx) => (
              <Table.Row key={idx} className={twMerge((idx + 1) % 2 !== 0 ? "bg-white" : "")}>
                <Table.Column className="px-4 py-2">
                  <Checkbox
                    onChange={() => handleTableDataCheckboxChange(datum)}
                    checked={isTableDataSelected(datum)}
                  />
                </Table.Column>

                <Table.Column className="px-2">{datum.productName}</Table.Column>
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
        <Pagination totalNumberOfData={filteredProducts.length} numberOfDataPerPage={10} currentPage={1} />
      </div>
    </div>
  )
}
