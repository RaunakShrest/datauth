"use client"

import { useQuery } from "@tanstack/react-query"
import React, { createContext, useContext, useEffect, useState } from "react"
import { fetchProducts } from "./query-provider/api-request-functions/api-requests"
import { reactQueryStaleTime } from "@/utils/staticUtils"

const ProductsContext = createContext()

export const useProducts = () => {
  const context = useContext(ProductsContext)

  if (!context) {
    throw new Error("use useProductsContext within the context of ProductsProvider")
  }

  return context
}

export default function ProductsProvider({ children, companyId }) {
  const [isAsc, setIsAsc] = useState(false)

  const productsFromApi = useQuery({
    queryKey: ["fetchProducts", companyId],
    queryFn: () => fetchProducts({ companyId }),
    staleTime: reactQueryStaleTime,
  })

  const [products, setProducts] = useState([])
  const [columns, setColumns] = useState([
    {
      id: "product-name",
      text: "Product Name",
      dataKey: "productName",
      isSortable: true,
      width: "150px",
    },
    {
      id: "company-manufacturer",
      text: "Manufacturer",
      dataKey: "companymanufacturer",
      isSortable: true,
      width: "150px",
    },
    {
      id: "product-price",
      text: "Price",
      dataKey: "productPrice",
      isSortable: true,
      width: "100px",
    },
    {
      id: "product-sku",
      text: "SKU",
      dataKey: "productSku",
      isSortable: false,
      width: "100px",
    },
    {
      id: "batchId",
      text: "Batch",
      dataKey: "batchid",
      isSortable: true,
      width: "150px",
    },
    { id: "product-status", text: "Status", dataKey: "status", isSortable: true, width: "100px" },
    { id: "createdAt", text: "Created Date", dataKey: "createdAt", isSortable: true, width: "150px" },
    { id: "qr-code", text: "QR Code", dataKey: "qr-code", isSortable: false, width: "40px" },
  ])
  const [selectedData, setSelectedData] = useState([])

  const sortData = (basis) => {
    setIsAsc((prev) => !prev)
    const dataCopy = JSON.parse(JSON.stringify(products))

    const sortedData = dataCopy?.sort((a, b) => (isAsc ? (a[basis] > b[basis] ? 1 : -1) : a[basis] < b[basis] ? 1 : -1))

    setProducts(sortedData)
  }

  useEffect(() => {
    setProducts(productsFromApi.isFetched ? (productsFromApi.data?.data ?? []) : [])
  }, [productsFromApi.data])

  return (
    <ProductsContext.Provider
      value={{ isAsc, products, setProducts, columns, sortData, selectedData, setSelectedData }}
    >
      {children}
    </ProductsContext.Provider>
  )
}
