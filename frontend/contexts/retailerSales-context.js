"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"
import { getCurrentUser } from "./query-provider/api-request-functions/api-requests"

const RetailerSalesContext = createContext()

export const useRetailerSales = () => {
  const context = useContext(RetailerSalesContext)

  if (!context) {
    throw new Error("use useRetailers within the context of RetailersProvider")
  }

  return context
}

export default function RetailerSalesProvider({ children }) {
  const [isAsc, setIsAsc] = useState(true)
  const [userRole, setUserRole] = useState("")
  const [data, setData] = useState({
    data: [],
    columns: [],
  })
  const initialStartDate = new Date()
  initialStartDate.setMonth(initialStartDate.getMonth() - 1) // Set to one month before today
  const initialEndDate = new Date()
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    productNameSearch: "",
    customerNameSearch: "",
    retailerNameSearch: "",
    companyNameSearch: "",
    startDate: initialStartDate.toISOString().split("T")[0],
    endDate: initialEndDate.toISOString().split("T")[0],
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

  // Update columns based on user role
  useEffect(() => {
    if (userRole) {
      setData((prev) => ({
        ...prev,
        columns: [
          {
            id: "blockChainVerified",
            text: "BC Verification",
            dataKey: "blockChainVerified",
            isSortable: false,
            width: "150px",
          },
          ...(userRole !== "retailer"
            ? [
                {
                  id: "soldBy",
                  text: "Retailer",
                  dataKey: "companyName",
                  isSortable: true,
                  width: "150px",
                },
              ]
            : []),
          {
            id: "customer-name",
            text: "Customer",
            dataKey: "name",
            isSortable: true,
            width: "150px",
          },
          {
            id: "customer-email",
            text: "Email",
            dataKey: "email",
            isSortable: true,
            width: "250px",
          },
          {
            id: "customer-phoneNumber",
            text: "Phone",
            dataKey: "phoneNumber",
            isSortable: false,
            width: "150px",
          },
          {
            id: "productManufacturer",
            text: "Company",
            dataKey: "productManufacturer.companyName",
            isSortable: true,
            width: "200px",
          },
          {
            id: "soldProducts",
            text: "Product",
            dataKey: "soldProducts",
            isSortable: true,
            width: "150px",
          },
          {
            id: "productPrice",
            text: "Price",
            dataKey: "productPrice",
            isSortable: true,
            width: "100px",
          },
          {
            id: "batchId",
            text: "Batch",
            dataKey: "batchId",
            isSortable: true,
            width: "250px",
          },
          {
            id: "createdAt",
            text: "Created Date",
            dataKey: "createdAt",
            isSortable: true,
            width: "250px",
          },
        ],
      }))
    }
  }, [userRole])

  const [selectedData, setSelectedData] = useState([])
  const [dataLoading, setDataLoading] = useState(true)

  const sortData = (basis) => {
    setIsAsc((prev) => !prev)
    const dataCopy = [...data.data]
    const sortedData = dataCopy?.sort((a, b) => (isAsc ? (a[basis] > b[basis] ? 1 : -1) : a[basis] < b[basis] ? 1 : -1))

    setData((prev) => ({ ...prev, data: sortedData }))
  }

  // Fetch sales data with filters
  const fetchRetailerSales = async () => {
    setDataLoading(true)
    try {
      const accessToken = localStorage.getItem("accessToken")
      if (!accessToken) {
        throw new Error("No token found")
      }

      const query = new URLSearchParams(filters).toString()
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL_DEV}/customerInfo/soldProducts?${query}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      setData((prev) => ({
        ...prev,
        data: response.data.message || [],
        pagination: response.data?.message?.pagination || [],
      }))
    } catch (error) {
      console.error("Error fetching retailer sales data", error)
    } finally {
      setDataLoading(false)
    }
  }

  // Refetch data when filters change
  useEffect(() => {
    fetchRetailerSales()
  }, [filters])

  return (
    <RetailerSalesContext.Provider
      value={{
        data,
        setData,
        sortData,
        selectedData,
        setSelectedData,
        fetchRetailerSales,
        userRole,
        filters,
        setFilters,
        dataLoading,
      }}
    >
      {children}
    </RetailerSalesContext.Provider>
  )
}
