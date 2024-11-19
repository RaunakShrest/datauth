"use client"

import React, { useState } from "react"
import Button from "../elements/button"
import axios from "axios"
import toast from "react-hot-toast"

const AddBatchIdModal = ({ isOpen, onClose, onSuccess }) => {
  const [batchId, setBatchId] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [validationError, setValidationError] = useState("")
  const validateTimeDifference = (start, end) => {
    const diff = (new Date(end) - new Date(start)) / (1000 * 60 * 60) // Difference in hours
    return diff >= 1
  }

  const handleSaveBatchId = async () => {
    if (!batchId || !startDate || !endDate) {
      setValidationError("All fields are required.")
      return
    }

    if (new Date(endDate) < new Date(startDate)) {
      setValidationError("End date cannot be before start date.")
      return
    }
    if (!validateTimeDifference(startDate, endDate)) {
      setValidationError("The time difference between start and end dates must be at least 1 hour.")
      return
    }

    setValidationError("") // Clear previous errors if validation passes

    try {
      const accessToken = localStorage.getItem("accessToken")

      if (!accessToken) {
        throw new Error("Token not found. Please log in again.")
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/batch/createBatchId`,
        { batchId, startDate, endDate },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )

      if (response.status === 201) {
        toast.success("Batch ID posted successfully!")
        handleClose()
        onSuccess()
      } else {
        toast.error(`Failed to create batch ID: ${response.data.message || "Unexpected response."}`)
      }
    } catch (error) {
      if (error.response) {
        toast.error(`Error saving Batch ID: ${error.response.data.message || "Unknown error."}`)
      } else {
        console.error("An error occurred while saving the Batch ID.")
      }
    }
  }

  const handleClose = () => {
    setBatchId("")
    setStartDate("")
    setEndDate("")
    setValidationError("")
    onClose() // Trigger the parent onClose handler
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-1/3 rounded-lg bg-white p-6 shadow-lg">
        <h3 className="mb-4 text-xl font-bold">Add Batch ID</h3>
        <input
          type="text"
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
          placeholder="Enter Batch ID"
          className="mb-4 w-full rounded-md border border-gray-300 p-2"
        />
        <div className="mb-4 flex gap-4">
          <div className="flex-1">
            <label
              className="mb-2 block text-sm font-bold"
              htmlFor="startDate"
            >
              Start Date & Time
            </label>
            <input
              type="datetime-local"
              id="startDate"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value)

                if (new Date(endDate) >= new Date(e.target.value)) {
                  setValidationError("")
                }
              }}
              className="w-full rounded-md border border-gray-300 p-2"
            />
          </div>
          <div className="flex-1">
            <label
              className="mb-2 block text-sm font-bold"
              htmlFor="endDate"
            >
              End Date & Time
            </label>
            <input
              type="datetime-local"
              id="endDate"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value)
                if (!validateTimeDifference(startDate, e.target.value)) {
                  setValidationError("The time difference between start and end dates must be at least 1 hour.")
                } else {
                  setValidationError("")
                }
              }}
              className="w-full rounded-md border border-gray-300 p-2"
            />
          </div>
        </div>
        {validationError && <p className="mb-4 text-sm text-red-500">{validationError}</p>}
        <div className="flex justify-end gap-4">
          <Button
            onClick={handleClose}
            className="bg-gray-400 px-4 py-2 text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveBatchId}
            className="bg-[#017082] px-4 py-2 text-white"
            disabled={!!validationError}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AddBatchIdModal
