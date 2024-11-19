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

          { id: "createdAt", text: "Created Date", dataKey: "createdAt", isSortable: true, width: "250px" },
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

  const fetchRetailerSales = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken") // Replace 'token' with the actual key if different
      if (!accessToken) {
        throw new Error("No token found")
      }

      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL_DEV}/customerInfo/soldProducts`, {
        headers: {
          Authorization: `Bearer ${accessToken}`, // Pass the Bearer token in the Authorization header
        },
      })
      setData((prev) => ({
        ...prev,
        data: response.data.message || [],
      }))
    } catch (error) {
      console.error("Error fetching retailer sales data", error)
    }
  }

  useEffect(() => {
    fetchRetailerSales()
  }, [])

  return (
    <RetailerSalesContext.Provider
      value={{ data, setData, sortData, selectedData, setSelectedData, fetchRetailerSales, userRole }}
    >
      {children}
    </RetailerSalesContext.Provider>
  )
}
