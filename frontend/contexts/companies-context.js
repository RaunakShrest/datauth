"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"

const CompaniesContext = React.createContext()

export const useCompanies = () => {
  const context = React.useContext(CompaniesContext)

  if (!context) {
    throw new Error("use useCompanies within the scope of CompaniesProvider")
  }

  return context
}

export default function CompaniesProvider({ children }) {
  const [isAsc, setIsAsc] = useState(true)
  const [dataLoading, setDataLoading] = useState(true)
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
        id: "company-name",
        text: "Company Name",
        dataKey: "companyName",
        isSortable: true,
        width: "250px",
      },
      { id: "company-owner-name", text: "Owner Name", dataKey: "name", isSortable: true, width: "150px" },
      {
        id: "Phone number",
        text: "Phone",
        dataKey: "phone",
        isSortable: false,
        width: "150px",
      },
      {
        id: "Email",
        text: "Email",
        dataKey: "email",
        isSortable: false,
        width: "250px",
      },
      {
        id: "company-product-type",
        text: "Product Type",
        dataKey: "companyProductType",
        isSortable: true,
        width: "150px",
      },
      { id: "company-status", text: "Status", dataKey: "status", isSortable: true, width: "120px" },
      {
        id: "createdDate",
        text: "Created Date",
        dataKey: "createdDate",
        isSortable: true,
        width: "200px",
      },
    ],
  })
  const [selectedData, setSelectedData] = useState([])

  const fetchCompanies = async () => {
    setDataLoading(true)
    try {
      const token = localStorage.getItem("accessToken")

      if (!token) {
        throw new Error("Access token not found")
      }

      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL_DEV}/users/get-companies`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setData((prev) => ({ ...prev, data: response.data.data || [] }))
    } catch (error) {
      console.error("Error fetching companies data:", error)
    } finally {
      setDataLoading(false)
    }
  }

  useEffect(() => {
    fetchCompanies()
  }, [])

  const sortData = (basis) => {
    setIsAsc((prev) => !prev)

    const dataCopy = [...data.data]
    const sortedData = dataCopy?.sort((a, b) => (isAsc ? (a[basis] > b[basis] ? 1 : -1) : a[basis] < b[basis] ? 1 : -1))

    setData((prev) => ({ ...prev, data: sortedData }))
  }

  return (
    <CompaniesContext.Provider
      value={{ data, setData, sortData, selectedData, setSelectedData, fetchCompanies, dataLoading, setDataLoading }}
    >
      {children}
    </CompaniesContext.Provider>
  )
}
