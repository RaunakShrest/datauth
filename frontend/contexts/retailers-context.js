"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"
import { getCurrentUser } from "./query-provider/api-request-functions/api-requests"

const RetailersContext = createContext()

export const useRetailers = () => {
  const context = useContext(RetailersContext)

  if (!context) {
    throw new Error("use useRetailers within the context of RetailersProvider")
  }

  return context
}

export default function RetailersProvider({ children }) {
  const [isAsc, setIsAsc] = useState(true)
  const [filters, setFilters] = useState({
    page: 1,
    limit: 2,
  })

  const [data, setData] = useState({
    data: [],
    columns: [
      {
        id: "blockChainVerified",
        text: "BC Verification",
        dataKey: "blockChainVerified",
        isSortable: false,
        width: "150px",
      },
      {
        id: "retailer-name",
        text: "Retailer Name",
        dataKey: "retailerName",
        width: "250px",
      },
      {
        id: "retail-owner-name",
        text: "Owner Name",
        dataKey: "name",
        width: "150px",
      },
      {
        id: "phone",
        text: "Phone",
        dataKey: "phone",
        isSortable: false,
        width: "150px",
      },
      {
        id: "email",
        text: "Email",
        dataKey: "email",
        width: "300px",
      },
      {
        id: "retailer-status",
        text: "Status",
        dataKey: "status",
        isSortable: true,
        width: "100px",
      },
      { id: "createdAt", text: "Created Date", dataKey: "createdAt", isSortable: true, width: "150px" },
    ],
  })
  const [selectedData, setSelectedData] = useState([])
  const [userRole, setUserRole] = useState("")

  const sortData = (basis) => {
    setIsAsc((prev) => !prev)
    const dataCopy = [...data.data]
    const sortedData = dataCopy?.sort((a, b) => (isAsc ? (a[basis] > b[basis] ? 1 : -1) : a[basis] < b[basis] ? 1 : -1))

    setData((prev) => ({ ...prev, data: sortedData }))
  }

  // const sortData = (basis) => {
  //   setFilters((prev) => ({
  //     ...prev,
  //     sort: basis,
  //     order: prev.order === "asc" ? "desc" : "asc",
  //   }))
  // }
  const fetchRetailers = async () => {
    try {
      // Retrieve the accessToken from localStorage
      const accessToken = localStorage.getItem("accessToken")

      if (!accessToken) {
        console.error("Access token not found in localStorage")
        return
      }

      // Construct the query string from filters
      const query = new URLSearchParams(filters).toString()

      // Make the API request with the Authorization header
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL_DEV}/retailers/getRetailers?${query}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      console.log("response from fetchRetailers", response.data)

      // Update the state with fetched data
      setData((prev) => ({
        ...prev,
        data: response.data?.message?.retailers || [],
        pagination: response.data?.message?.pagination || {},
      }))
    } catch (error) {
      console.error("Error fetching retailers data", error)
    }
  }

  useEffect(() => {
    fetchRetailers()
  }, [filters]) // Run whenever filters change

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
  return (
    <RetailersContext.Provider
      value={{ data, setData, sortData, selectedData, setSelectedData, fetchRetailers, userRole, filters, setFilters }}
    >
      {children}
    </RetailersContext.Provider>
  )
}
