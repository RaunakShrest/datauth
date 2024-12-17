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
  const initialStartDate = new Date()
  initialStartDate.setMonth(initialStartDate.getMonth() - 1) // Set to one month before today
  const initialEndDate = new Date()
  const [filters, setFilters] = useState({
    limit: 10,
    page: 1,
    productNameSearch: "",
    batchIdSearch: "",
    retailerNameSearch: "",
    startDate: initialStartDate.toISOString().split("T")[0],
    endDate: initialEndDate.toISOString().split("T")[0],
  })
  const [data, setData] = useState({
    data: [],
    columns: [],
  })
  const [dataLoading, setDataLoading] = useState(true)

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
          ...(userRole !== "company"
            ? [
                {
                  id: "company-name",
                  text: "Company Name",
                  dataKey: "companyName",
                  isSortable: true,
                  width: "200px",
                },
              ]
            : []),
          {
            id: "customer-name",
            text: "Customer Name",
            dataKey: "name",
            isSortable: true,
            width: "200px",
          },
          {
            id: "customer-email",
            text: "Customer Email",
            dataKey: "email",
            isSortable: true,
            width: "200px",
          },
          {
            id: "soldProducts",
            text: "Product",
            dataKey: "soldProducts",
            isSortable: true,
            width: "200px",
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
    setDataLoading(true)
    try {
      const accessToken = localStorage.getItem("accessToken")
      if (!accessToken) {
        throw new Error("No token found")
      }
      const query = new URLSearchParams(filters).toString()
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/customerInfo/soldProductsByCompany?${query}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )
      setData((prev) => ({
        ...prev,
        data: response?.data?.message?.salesData || [],
        pagination: response?.data?.message?.pagination || [],
      }))
    } catch (error) {
      console.error("Error fetching company sales data", error)
    } finally {
      setDataLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanySales()
  }, [filters])

  return (
    <CompanySalesContext.Provider
      value={{
        data,
        setData,
        sortData,
        selectedData,
        setSelectedData,
        fetchCompanySales,
        userRole,
        filters,
        setFilters,
        dataLoading,
      }}
    >
      {children}
    </CompanySalesContext.Provider>
  )
}
