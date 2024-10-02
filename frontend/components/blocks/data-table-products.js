"use client"

import { useRouter } from "next/navigation"
import React, { useRef } from "react"
import Table from "./table"
import ContextMenu from "./context-menu"
import Pagination from "../composites/pagination"
import Checkbox from "../elements/checkbox"
import { twMerge } from "tailwind-merge"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons"
import { useProducts } from "@/contexts/products-context"
import ImgWithWrapper from "../composites/img-with-wrapper"
import { currencyFormat } from "@/utils/functionalUtils"

export default function DataTable() {
  const router = useRouter()

  const tableRef = useRef()
  const contextMenuRef = useRef()

  const { products, columns, sortData, selectedData, setSelectedData } = useProducts()

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

              <Table.Heading
                className="pl-4"
                style={{ width: "5rem" }}
              >
                Action
              </Table.Heading>
            </Table.Row>
          </Table.Head>

          <Table.Body>
            {products?.map((datum, idx) => (
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

                <Table.Column className="px-2">{datum.productName}</Table.Column>

                <Table.Column className="p-2">
                  <span className="line-clamp-1">{datum.productManufacturer?.companyName}</span>
                </Table.Column>

                <Table.Column className="overflow-hidden p-2">
                  <div
                    dangerouslySetInnerHTML={{ __html: datum.productDescription }}
                    className="line-clamp-1"
                  ></div>
                </Table.Column>

                <Table.Column className="overflow-hidden p-2">
                  <span className="line-clamp-1">{datum.productType?.name}</span>
                </Table.Column>

                <Table.Column className="p-2">{currencyFormat(datum.productPrice)}</Table.Column>

                <Table.Column className="p-2">{datum.productSku}</Table.Column>
                
                <Table.Column className="p-2">{datum.batchId?.batchId}</Table.Column>

                <Table.Column className="p-2">{datum.productStatus}</Table.Column>

                            <Table.Column className="p-2">
                <a href={datum.qrUrl} target="_blank" rel="noopener noreferrer">
                  <ImgWithWrapper
                    wrapperClassName="size-10 mx-auto"
                    imageAttributes={{ src: datum.qrUrl, alt: "product-qr" }}
                  />
              </a>
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

                      <ContextMenu.Item
                        className="rounded-md bg-[#017082]"
                        onClick={() => null}
                      >
                        Delete
                      </ContextMenu.Item>

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
          totalNumberOfData={260}
          numberOfDataPerPage={10}
          currentPage={8}
        />
      </div>
    </div>
  )
}
