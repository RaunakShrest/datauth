"use client"

import { useRouter } from "next/navigation"
import React, { useRef, useState, useEffect } from "react"
import Table from "./table"
import ContextMenu from "./context-menu"
import Pagination from "../composites/pagination"
import Checkbox from "../elements/checkbox"
import { twMerge } from "tailwind-merge"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEllipsisVertical, faUserPlus } from "@fortawesome/free-solid-svg-icons"
import { useProducts } from "@/contexts/products-context"
import ImgWithWrapper from "../composites/img-with-wrapper"
import QrModal from "../elements/qrmodal"
import CustomerFormModal from "../composites/customerFormModel"
import axios from "axios"
import { getCurrentUser } from "@/contexts/query-provider/api-request-functions/api-requests"
import { useDebounce } from "@/utils/debounce"

export default function DataTable() {
  const router = useRouter()

  const tableRef = useRef()
  const contextMenuRef = useRef()

  const { products, columns, sortData, selectedData, setSelectedData, setProducts, filters, setFilters, loadProducts } =
    useProducts()

  const [searchBatchId, setSearchBatchId] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [qrImageUrl, setQrImageUrl] = useState("")
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [customerInfo, setCustomerInfo] = useState(null)
  const [userRole, setUserRole] = useState("")
  const numberOfDataPerPage = 8

  const indexOfLastData = currentPage * numberOfDataPerPage
  const indexOfFirstData = indexOfLastData - numberOfDataPerPage

  const filteredData = products?.productItems
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const currentUserData = await getCurrentUser()

        setUserRole(currentUserData.data.userType)
        setCurrentUser(currentUserData.data._id) // Set current user
      } catch (error) {
        console.error("Error fetching current user:", error)
      }
    }

    fetchCurrentUser()
  }, [])
  const handleTableHeadingCheckboxChange = () => {
    if (selectedData.length === products?.productItems?.length) {
      setSelectedData([])
    } else {
      setSelectedData([...products.productItems])
    }
  }

  const handleTableDataCheckboxChange = (clickedData) => {
    const isAlreadySelected = selectedData.some((eachSelected) => eachSelected.id === clickedData.id)

    if (isAlreadySelected) {
      setSelectedData((prev) => prev.filter((eachPrev) => eachPrev.id !== clickedData.id))
    } else {
      setSelectedData((prev) => [...prev, clickedData])
    }
  }
  const handleAddCustomerClick = async (productId) => {
    if (currentUser) {
      setSelectedProductId(productId)
      setShowCustomerModal(true)

      try {
        const accessToken = localStorage.getItem("accessToken")

        if (!accessToken) {
          console.error("Access token is missing")
          return
        }

        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL_DEV}/customerInfo/getCustomerInfo`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: { productId },
        })

        setCustomerInfo(response.data) // Store the fetched customer data
      } catch (error) {
        console.error("Error fetching customer data:", error)
        setCustomerInfo(null)
      }
    } else {
      console.error("Current user is not defined")
    }
  }

  const handleCustomerSave = (newStatus, productId) => {
    setShowCustomerModal(false)

    setProducts((prevProducts) => {
      const updatedItems = prevProducts.productItems.map((product) =>
        product.id === productId ? { ...product, purchasedStatus: true, productStatus: newStatus } : product,
      )
      return { ...prevProducts, productItems: updatedItems }
    })
  }

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    const printableContent = selectedData
      .map(
        (item, index) => `
        <div style="margin-bottom: 20px;">
          <img src="${item.qrUrl}" alt="QR Code" style="width: 150px; height: 150px;"/>
          <p>SKU: ${item.productSku}</p>
        </div>
        ${index < selectedData.length - 1 ? '<hr style="border: 1px solid #000; margin: 20px 0;" />' : ""}`,
      )
      .join("")

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
    `)

    printWindow.document.close()
    printWindow.print()
  }

  const handleQrClick = (qrUrl) => {
    setQrImageUrl(qrUrl)
    setShowModal(true)
  }
  const handleDownloadQr = () => {
    selectedData.forEach((product) => {
      fetch(product.qrUrl)
        .then((response) => response.blob())
        .then((blob) => {
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement("a")
          link.href = url
          link.download = `QR_${product.productSku}.png` // Set the filename for download
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
        })
        .catch((error) => console.error("Error downloading image:", error))
    })
  }
  useEffect(() => {
    setFilters((prevFilters) => ({ ...prevFilters, page: currentPage }))
  }, [currentPage])

  const debouncedSearchBatchName = useDebounce({ searchValue: searchBatchId })
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      batchIdSearch: `${debouncedSearchBatchName} `.trim(),
    }))
  }, [debouncedSearchBatchName])
  return (
    <div className="space-y-4">
      {/* Search Field and Print Button */}
      <div className="mb-6 flex items-start justify-between">
        <input
          type="text"
          placeholder="Search by Batch ID"
          className="w-80 rounded-md border border-gray-600 p-2"
          value={searchBatchId}
          onChange={(e) => setSearchBatchId(e.target.value)}
        />
        <div className="flex justify-end">
          <button
            onClick={handlePrint}
            disabled={selectedData.length === 0}
            className={twMerge(
              "ml-4 rounded-md bg-[#02235E] px-4 py-2 text-white",
              selectedData.length === 0 ? "cursor-not-allowed opacity-50" : "",
            )}
          >
            Print Selected QR
          </button>
          <button
            onClick={handleDownloadQr}
            disabled={selectedData.length === 0}
            className={twMerge(
              "ml-4 rounded-md bg-[#0051DC] px-4 py-2 text-white",
              selectedData.length === 0 ? "cursor-not-allowed opacity-50" : "",
            )}
          >
            Download Selected QR
          </button>
        </div>
      </div>

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
                  checked={selectedData.length === products.length} // This makes the checkbox reflect the select all state
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
            {filteredData?.map((datum, idx) => (
              <Table.Row
                key={idx}
                className="border-b border-b-[#605E5E] bg-white"
              >
                <Table.Column className="px-4 py-2">
                  <Checkbox
                    onChange={() => handleTableDataCheckboxChange(datum)}
                    checked={selectedData.some((eachSelected) => eachSelected.id === datum.id)} // This makes each checkbox reflect its selection state
                  />
                </Table.Column>
                <Table.Column className="px-8">
                  <ImgWithWrapper
                    wrapperClassName="size-10 mx-15"
                    imageClassName="object-contain object-left"
                    imageAttributes={{
                      src:
                        datum?.blockChainVerified === false
                          ? "/assets/Unverified.png"
                          : datum?.blockChainVerified
                            ? "/assets/Verified2.png"
                            : "/assets/pending.png",
                      alt:
                        datum?.blockChainVerified === true
                          ? "Unverified Logo"
                          : datum?.blockChainVerified
                            ? "Verified Logo"
                            : "Unverified Logo",
                    }}
                  />
                </Table.Column>
                <Table.Column className="px-2">{datum.productName}</Table.Column>
                <Table.Column className="px-2">{datum.productManufacturer?.companyName || "N/A"}</Table.Column>
                <Table.Column className="p-2">{datum.productPrice}</Table.Column>
                <Table.Column className="p-2">{datum.productSku}</Table.Column>
                <Table.Column className="p-2">{datum.batchId?.batchId || "N/A"}</Table.Column>
                <Table.Column className="p-2">
                  {" "}
                  <span
                    className={twMerge(
                      "rounded-full px-2 py-1 text-white",
                      datum.productStatus === "pending"
                        ? "bg-red-500"
                        : datum.productStatus === "completed"
                          ? "bg-green-600"
                          : "bg-gray-500",
                    )}
                  >
                    {datum.productStatus}
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
                  <button onClick={() => handleQrClick(datum.qrUrl)}>
                    <ImgWithWrapper
                      wrapperClassName="size-10 mx-auto"
                      imageAttributes={{ src: datum.qrUrl, alt: "product-qr" }}
                    />
                  </button>
                </Table.Column>
                <Table.Column className="p-4">
                  {datum.purchasedStatus === true ? (
                    <span className="text bg-green-600 px-2 py-1 text-white">Purchased</span>
                  ) : datum.purchasedStatus === false ? (
                    <span className="text bg-yellow-500 px-2 py-1 text-white">In stock</span>
                  ) : (
                    <span className="px-2 py-1">N/A</span>
                  )}
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

                    <ContextMenu.Menu className="absolute z-10 w-[175px] space-y-1 bg-white/80 p-2 text-white">
                      <ContextMenu.Item
                        className="rounded-md bg-[#0000CC]"
                        onClick={() => router.push(`/products/${datum.id}`)}
                      >
                        View
                      </ContextMenu.Item>

                      <ContextMenu.Item
                        className="rounded-md bg-[#0000CC]"
                        onClick={() => router.push(`/products/${datum.id}/edit`)}
                      >
                        Edit
                      </ContextMenu.Item>

                      <ContextMenu.Item
                        className="rounded-md bg-[#0000CC]"
                        onClick={() => router.push()}
                      >
                        Delete
                      </ContextMenu.Item>
                    </ContextMenu.Menu>
                  </ContextMenu>
                  {userRole !== "company" && (
                    <FontAwesomeIcon
                      icon={faUserPlus}
                      className="fa-fw"
                      size="sm"
                      onClick={() => handleAddCustomerClick(datum.id)} // Pass product ID here
                    />
                  )}
                </Table.Column>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>

      <div className="text-right">
        <Pagination
          totalNumberOfData={products?.pagination?.totalItems || 0}
          numberOfDataPerPage={filters.limit}
          currentPage={currentPage}
          onPageChange={(newPage) => setCurrentPage(newPage)}
        />
      </div>

      <QrModal
        show={showModal}
        onClose={() => setShowModal(false)}
      >
        <img
          src={qrImageUrl}
          alt="QR Code"
          className="h-auto max-h-[350px] w-full object-contain"
        />
      </QrModal>
      <CustomerFormModal
        show={showCustomerModal && currentUser !== null}
        onClose={() => setShowCustomerModal(false)}
        customerInfo={customerInfo} // Pass the customer data to modal
        productId={selectedProductId}
        currentUserId={currentUser}
        onSave={handleCustomerSave}
      />
    </div>
  )
}
