"use client"

import React, { useState } from "react"
import Button from "../elements/button"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEllipsisVertical, faTrashCan } from "@fortawesome/free-solid-svg-icons"
import DataTable from "../blocks/data-table-products"
import ProductsProvider from "@/contexts/products-context"
import { useRouter } from "next/navigation"
import axios from "axios" 
import toast from "react-hot-toast"

export default function ProductsTemplate() {
  const title = "Products List"
  const router = useRouter()

  // State for controlling modal visibility and storing batch ID
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [batchId, setBatchId] = useState("")

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setBatchId("") // Reset the input field on close
  }

const handleSaveBatchId = async () => {
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL_DEV}/batch/createBatchId`, { batchId });
    if (response.status === 201) {
      toast.success("Batch ID posted successfully!");
      handleCloseModal(); 
    } else {
      toast.error(`Failed to create batch ID: ${response.data.message || "Unexpected response."}`);
      console.error("Unexpected response status:", response.status);
    }
  } catch (error) {
    if (error.response) {
      toast.error(`Error saving Batch ID: ${error.response.data.message || "Unknown error."}`);
      console.error("Error saving Batch ID:", error.response.data);
    } else {
      toast.error("An error occurred while saving the Batch ID.");
      console.error("An error occurred while saving the Batch ID:", error.message);
    }
  }
}


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>

        <div className="flex gap-4">
          <Button
            onClick={() => router.push("/products/add-product")}
            className="flex items-center bg-[#017082] px-4 py-2 text-white mr-2"
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
            <span className="inline-block">Add Product</span>
          </Button>

          <Button
            onClick={handleOpenModal}
            className="flex items-center bg-[#017082] px-4 py-2 text-white"
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
            <span className="inline-block">Add BatchId</span>
          </Button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
            <h3 className="text-xl font-bold mb-4">Add Batch ID</h3>
            <input
              type="text"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              placeholder="Enter Batch ID"
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
            />
            <div className="flex justify-end gap-4">
              <Button onClick={handleCloseModal} className="bg-gray-400 px-4 py-2 text-white">
                Cancel
              </Button>
              <Button onClick={handleSaveBatchId} className="bg-[#017082] px-4 py-2 text-white">
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      <ProductsProvider>
        <div className="flex items-center gap-2">
          <div>
            <Button>
              <FontAwesomeIcon icon={faTrashCan} />
            </Button>

            <Button>
              <FontAwesomeIcon icon={faEllipsisVertical} />
            </Button>
          </div>
        </div>

        <div>
          <DataTable />
        </div>
      </ProductsProvider>
    </div>
  )
}
