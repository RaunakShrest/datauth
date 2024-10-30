"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"
import { getCurrentUser } from "./query-provider/api-request-functions/api-requests"

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
  const [userRole, setUserRole] = useState("")
  const [data, setData] = useState({
    data: [],
    columns: [],
  })

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await getCurrentUser()
        setUserRole(user.data.userType)
      } catch (error) {
        console.error("Error fetching current user:", error)
      }
    }

    fetchCurrentUser()
  }, [])

  useEffect(() => {
    // Only set columns after userRole is fetched
    if (userRole) {
      setData((prev) => ({
        ...prev,
        columns: [
          ...(userRole !== "company"
            ? [
                {
                  id: "company-name",
                  text: "Company Name",
                  dataKey: "companyName",
                  isSortable: true,
                  width: "150px",
                },
              ]
            : []),
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
            text: "Retailer Name",
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
      }))
    }
  }, [userRole])

  const [selectedData, setSelectedData] = useState([])

  const sortData = (basis) => {
    setIsAsc((prev) => !prev)
    const dataCopy = [...data.data]
    const sortedData = dataCopy?.sort((a, b) => (isAsc ? (a[basis] > b[basis] ? 1 : -1) : a[basis] < b[basis] ? 1 : -1))

    setData((prev) => ({ ...prev, data: sortedData }))
  }

  const fetchCompanySales = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken")
      if (!accessToken) {
        throw new Error("No token found")
      }

      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL_DEV}/customerInfo/soldProductsByCompany`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
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
    <CompanySalesContext.Provider
      value={{ data, setData, sortData, selectedData, setSelectedData, fetchCompanySales, userRole }}
    >
      {children}
    </CompanySalesContext.Provider>
  )
}
