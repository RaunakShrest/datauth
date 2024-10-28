"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

const CompanySalesContext = createContext()

export const useCompanySales = () => {
  const context = useContext(CompanySalesContext)

  if (!context) {
    throw new Error("use useRetailers within the context of RetailersProvider")
  }

  return context
}

export default function CompanySalesProvider({ children }) {
  const [isAsc, setIsAsc] = useState(true)

  const [data, setData] = useState({
    data: [], // Initially empty, will be populated by API call
    columns: [
      {
        id: "customer-name",
        text: "Customer Name",
        dataKey: "name",
        isSortable: true,
        width: "150px",
      },

      {
        id: "soldProducts",
        text: "Product",
        dataKey: "soldProducts",
        isSortable: true,
        width: "150px",
      },
      {
        id: "retailer-name",
        text: "Retailer",
        dataKey: "companyName",
        isSortable: false,
        width: "150px",
      },
      {
        id: "productPrice",
        text: "Price",
        dataKey: "productPrice",
        isSortable: true,
        width: "80px",
      },
      {
        id: "batchId",
        text: "Batch",
        dataKey: "batchId",
        isSortable: true,
        width: "200px",
      },
      { id: "createdAt", text: "Created Date", dataKey: "createdAt", isSortable: true, width: "200px" },
    ],
  })
  const [selectedData, setSelectedData] = useState([])

  const sortData = (basis) => {
    setIsAsc((prev) => !prev)
    const dataCopy = [...data.data]
    const sortedData = dataCopy?.sort((a, b) => (isAsc ? (a[basis] > b[basis] ? 1 : -1) : a[basis] < b[basis] ? 1 : -1))

    setData((prev) => ({ ...prev, data: sortedData }))
  }

  const fetchCompanySales = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken") // Replace 'token' with the actual key if different
      if (!accessToken) {
        throw new Error("No token found")
      }

      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL_DEV}/customerInfo/soldProductsByCompany`, {
        headers: {
          Authorization: `Bearer ${accessToken}`, // Pass the Bearer token in the Authorization header
        },
      })
      setData((prev) => ({
        ...prev,
        data: response.data.message || [],
      }))
    } catch (error) {
      console.error("Error fetching company sales data", error)
    }
  }

  useEffect(() => {
    fetchCompanySales()
  }, [])

  return (
    <CompanySalesContext.Provider value={{ data, setData, sortData, selectedData, setSelectedData, fetchCompanySales }}>
      {children}
    </CompanySalesContext.Provider>
  )
}
