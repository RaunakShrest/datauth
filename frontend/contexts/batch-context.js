"use client"

import React, { useState, useEffect } from "react"
import axios from "axios"

const BatchContext = React.createContext()

export const useBatch = () => {
  const context = React.useContext(BatchContext)

  if (!context) {
    throw new Error("use useBatch within the scope of BatchesProvider")
  }

  return context
}

export default function BatchProvider({ children, refreshTrigger }) {
  const [isAsc, setIsAsc] = useState(true)
  const [data, setData] = useState({
    data: [],
    columns: [
      {
        id: "batchId",
        text: "Batch Id",
        dataKey: "batchId",
        isSortable: true,
        width: "250px",
      },
      { id: "createdAt", text: "Created Date", dataKey: "createdAt", isSortable: true, width: "150px" },
      { id: "startDate", text: "Started Date", dataKey: "startDate", isSortable: true, width: "150px" },
      { id: "endDate", text: "End Date", dataKey: "endDate", isSortable: true, width: "150px" },
    ],
  })
  const [selectedData, setSelectedData] = useState([])

  const fetchBatches = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken")
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL_DEV}/batch/getBatchIds`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      setData((prev) => ({ ...prev, data: response.data.data || [] }))
    } catch (error) {
      console.error("Error fetching batches data:", error)
    }
  }

  useEffect(() => {
    fetchBatches()
  }, [refreshTrigger])

  const sortData = (basis) => {
    setIsAsc((prev) => !prev)

    const dataCopy = [...data.data]
    const sortedData = dataCopy?.sort((a, b) => (isAsc ? (a[basis] > b[basis] ? 1 : -1) : a[basis] < b[basis] ? 1 : -1))

    setData((prev) => ({ ...prev, data: sortedData }))
  }

  return (
    <BatchContext.Provider value={{ data, setData, sortData, selectedData, setSelectedData }}>
      {children}
    </BatchContext.Provider>
  )
}