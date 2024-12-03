"use client"
import React from "react"
import DataTable from "../blocks/data-table-batch"
import BatchProvider from "@/contexts/batch-context"
import { useState } from "react"
import AddBatchIdModal from "../modals/batchIdPopup"
import Button from "../elements/button"

export default function BatchTemplate() {
  const title = "Batches"
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleModalSuccess = () => {
    setRefreshTrigger((prev) => prev + 1)
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-5xl font-bold">{title}</h2>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center bg-[#02235E] px-4 py-2 text-white"
        >
          <svg
            className="inline-block w-10"
            width="25"
            height="25"
            viewBox="0 0 25 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.5 0.6875C9.37889 0.72537 6.39629 1.98206 4.18917 4.18917C1.98206 6.39629 0.72537 9.37889 0.6875 12.5C0.72537 15.6211 1.98206 18.6037 4.18917 20.8108C6.39629 23.0179 9.37889 24.2746 12.5 24.3125C15.6211 24.2746 18.6037 23.0179 20.8108 20.8108C23.0179 18.6037 24.2746 15.6211 24.3125 12.5C24.2746 9.37889 23.0179 6.39629 20.8108 4.18917C18.6037 1.98206 15.6211 0.72537 12.5 0.6875ZM19.25 13.3438H13.3438V19.25H11.6562V13.3438H5.75V11.6562H11.6562V5.75H13.3438V11.6562H19.25V13.3438Z"
              fill="white"
            />
          </svg>
          Add BatchId
        </Button>
      </div>

      <BatchProvider refreshTrigger={refreshTrigger}>
        <div className="flex items-center gap-2"></div>

        <div>
          <DataTable />
        </div>
      </BatchProvider>
      <AddBatchIdModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}
