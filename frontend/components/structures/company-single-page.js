"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Button from "../elements/button"
import axios from "axios"
import toast from "react-hot-toast"

export default function EditCompany({ params }) {
  const { "single-company": companyId } = params
  const router = useRouter()

  const [company, setCompany] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
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
    async function fetchCompanyDetails() {
      if (!companyId) return

      try {
        const accessToken = localStorage.getItem("accessToken")
        if (!accessToken) {
          throw new Error("Access token not found")
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/company/getSingleCompany/${companyId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        )

        const companyData = response.data.data

        setCompany(companyData)
        setFormData({
          fullName: `${companyData.firstName || ""} ${companyData.lastName || ""}`,
          companyName: companyData.companyName || "",
          productType: companyData.productType || "",
          address: {
            country: companyData.address?.country || "",
            state: companyData.address?.state || "",
            zip: companyData.address?.zip || "",
            city: companyData.address?.city || "",
            addressLine: companyData.address?.addressLine || "",
          },
          phoneNumber: companyData.phoneNumber || "",
          email: companyData.email || "",
        })
      } catch (err) {
        console.error("Error fetching company details:", err)
        setError("Failed to fetch company details")
      } finally {
        setLoading(false)
      }
    }

    fetchCompanyDetails()
  }, [companyId])

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
          ...company?.address,
          ...formData.address,
        }

        const updatedAddress = {}
        for (const addressKey in mergedAddress) {
          if (mergedAddress[addressKey] !== company?.address?.[addressKey] && mergedAddress[addressKey] !== "") {
            updatedAddress[addressKey] = mergedAddress[addressKey]
          }
        }

        if (Object.keys(updatedAddress).length > 0) {
          updatedFields.address = updatedAddress
        }
      } else if (formData[key] !== company?.[key] && formData[key] !== "") {
        updatedFields[key] = formData[key]
      }
    }

    return updatedFields
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const updatedData = getChangedFields()

    const [firstName, lastName] = formData.fullName.split(" ")

    if (formData.fullName !== `${company?.firstName} ${company?.lastName}`) {
      updatedData.firstName = firstName || ""
      updatedData.lastName = lastName || ""
    }

    updatedData.address = {
      ...company?.address,
      ...updatedData.address,
    }

    try {
      setSaving(true)
      const accessToken = localStorage.getItem("accessToken")
      if (!accessToken) {
        throw new Error("Access token not found while editing")
      }
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/company/editCompanyDetails/${companyId}`,
        updatedData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      )
      toast.success("Company edited sucessfully")
      router.push(`/companies`)
    } catch (error) {
      setError("Failed to update company")
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>{error}</div>

  return (
    <div>
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
          <label>Company Name</label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
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
