"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Button from "../elements/button"
import axios from "axios"
import toast from "react-hot-toast"

export default function EditRetailer({ params }) {
  const { "single-retailer": retailerId } = params
  const router = useRouter()

  const [retailer, setRetailer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState(null)
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    userType: "",
    productType: "",
    address: {
      country: "",
      state: "",
      zip: "",
      city: "",
      addressLine: "",
    },
    phoneNumber: "",
    email: "",
  })

  useEffect(() => {
    async function fetchRetailerDetails() {
      if (!retailerId) return

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/retailers/getSingleRetailer/${retailerId}`,
        )
        const retailerData = response.data.data
        setRetailer(retailerData)
        setFormData({
          fullName: `${retailerData.firstName || ""} ${retailerData.lastName || ""}`,
          companyName: retailerData.companyName || "",
          userType: retailerData.userType || "",
          productType: retailerData.productType || "",
          address: {
            country: retailerData.address?.country || "",
            state: retailerData.address?.state || "",
            zip: retailerData.address?.zip || "",
            city: retailerData.address?.city || "",
            addressLine: retailerData.address?.addressLine || "",
          },
          phoneNumber: retailerData.phoneNumber || "",
          email: retailerData.email || "",
        })
      } catch (err) {
        console.error("Error fetching retailer details:", err)
        setError("Failed to fetch retailer details")
      } finally {
        setLoading(false)
      }
    }

    fetchRetailerDetails()
  }, [retailerId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }))
  }

  const handleAddressChange = (e) => {
    const { name, value } = e.target
    setFormData((prevFormData) => ({
      ...prevFormData,
      address: {
        ...prevFormData.address,
        [name]: value,
      },
    }))
  }

  const getChangedFields = () => {
    const updatedFields = {}

    for (const key in formData) {
      if (key === "address") {
        const mergedAddress = {
          ...retailer?.address,
          ...formData.address,
        }

        const updatedAddress = {}
        for (const addressKey in mergedAddress) {
          if (mergedAddress[addressKey] !== retailer?.address?.[addressKey] && mergedAddress[addressKey] !== "") {
            updatedAddress[addressKey] = mergedAddress[addressKey]
          }
        }

        if (Object.keys(updatedAddress).length > 0) {
          updatedFields.address = updatedAddress
        }
      } else if (formData[key] !== retailer?.[key] && formData[key] !== "") {
        updatedFields[key] = formData[key]
      }
    }

    return updatedFields
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const updatedData = getChangedFields()

    const [firstName, lastName] = formData.fullName.split(" ")

    if (formData.fullName !== `${retailer?.firstName} ${retailer?.lastName}`) {
      updatedData.firstName = firstName || ""
      updatedData.lastName = lastName || ""
    }

    updatedData.address = {
      ...retailer?.address,
      ...updatedData.address,
    }

    try {
      const accessToken = localStorage.getItem("accessToken")
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/retailers/editRetailerDetails/${retailerId}`,
        updatedData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )
      toast.success("Retailer edited successfully")
      router.push(`/retailers`)
    } catch (error) {
      setError("Failed to update retailer")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>

  return (
    <div>
      {successMessage && <div className="mb-4 rounded bg-green-200 p-2 text-green-800">{successMessage}</div>}
      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <div>
          <label>Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full border px-2 py-1"
          />
        </div>
        <div>
          <label>Retailer Name</label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            className="w-full border px-2 py-1"
          />
        </div>
        <div>
          <label>User Type</label>
          <input
            type="text"
            name="userType"
            value={formData.userType}
            onChange={handleChange}
            className="w-full border px-2 py-1"
          />
        </div>
        <div>
          <label>Product Type</label>
          <input
            type="text"
            name="productType"
            value={formData.productType}
            onChange={handleChange}
            className="w-full border px-2 py-1"
          />
        </div>
        <div>
          <label>Country</label>
          <input
            type="text"
            name="country"
            value={formData.address.country}
            onChange={handleAddressChange}
            className="w-full border px-2 py-1"
          />
        </div>
        <div>
          <label>City</label>
          <input
            type="text"
            name="city"
            value={formData.address.city}
            onChange={handleAddressChange}
            className="w-full border px-2 py-1"
          />
        </div>
        <div>
          <label>Address Line</label>
          <input
            type="text"
            name="addressLine"
            value={formData.address.addressLine}
            onChange={handleAddressChange}
            className="w-full border px-2 py-1"
          />
        </div>
        <div>
          <label>Zip Code</label>
          <input
            type="text"
            name="zip"
            value={formData.address.zip}
            onChange={handleAddressChange}
            className="w-full border px-2 py-1"
          />
        </div>
        <div>
          <label>Phone Number</label>
          <input
            type="text"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="w-full border px-2 py-1"
          />
        </div>
        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border px-2 py-1"
          />
        </div>
        <div>
          <Button
            type="submit"
            disabled={saving}
            className="bg-[#02235E] px-8 py-2 text-white"
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}
