"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Button from "../elements/button"
import axios from "axios"
import toast from "react-hot-toast"

export default function EditSingleProductForm({ params }) {
  const { "single-product": productId } = params
  const router = useRouter()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    productName: "",
    productSku: "",
    productPrice: "",
    productDescription: "",
    productAttributes: [],
  })
  const [images, setImages] = useState([])
  const [imageFiles, setImageFiles] = useState([])
  const [imagePreviews, setImagePreviews] = useState([]) // To store image preview URLs
  const [removedImages, setRemovedImages] = useState([])

  // Fetch product details
  useEffect(() => {
    async function fetchProductDetails() {
      if (!productId) return

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/products/getSingleProduct/${productId}`,
        )
        const productData = response.data.data
        setProduct(productData)
        setFormData({
          productName: productData.productName || "",
          productPrice: productData.productPrice || "",
          productDescription: productData.productDescription || "",
          productSku: productData.productSku || "",
          productWebLink: productData.productWebLink || "",
          productAttributes: productData.productAttributes || [],
        })
        setImages(productData.productImages || [])
      } catch (err) {
        console.error("Error fetching product details:", err)
        setError("Failed to fetch product details")
      } finally {
        setLoading(false)
      }
    }

    fetchProductDetails()
  }, [productId])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: name === "productPrice" ? value.replace(/[^0-9.]/g, "") : value, // Ensure only numbers and decimal points are allowed
    }))
  }
  const handleAttributeChange = (index, e) => {
    const { name, value } = e.target
    setFormData((prevFormData) => {
      const updatedAttributes = [...prevFormData.productAttributes]
      updatedAttributes[index] = {
        ...updatedAttributes[index],
        [name]: value,
      }
      return {
        ...prevFormData,
        productAttributes: updatedAttributes,
      }
    })
  }

  const getChangedFields = () => {
    const updatedFields = {}
    for (const key in formData) {
      if (key === "productAttributes") {
        const updatedAttributes = formData.productAttributes.map(
          (attr, index) =>
            attr.attributeName !== product.productAttributes[index]?.attributeName ||
            attr.attributeValue !== product.productAttributes[index]?.attributeValue,
        )

        if (updatedAttributes.includes(true)) {
          updatedFields.productAttributes = formData.productAttributes
        }
      } else if (formData[key] !== product?.[key] && formData[key] !== "") {
        updatedFields[key] = formData[key]
      }
    }
    return updatedFields
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setImageFiles(files)
    const previewUrls = files.map((file) => URL.createObjectURL(file))
    setImagePreviews(previewUrls)
  }

  const handleImageRemove = (index, isExistingImage) => {
    if (isExistingImage) {
      setRemovedImages((prevRemoved) => [...prevRemoved, images[index]])
      setImages((prevImages) => prevImages.filter((_, imgIndex) => imgIndex !== index))
    } else {
      setImageFiles((prevFiles) => prevFiles.filter((_, fileIndex) => fileIndex !== index))
      setImagePreviews((prevPreviews) => prevPreviews.filter((_, previewIndex) => previewIndex !== index))
    }
  }
  const handleSubmit = async (e) => {
    e.preventDefault()

    const updatedData = getChangedFields()

    if (updatedData.productPrice) {
      updatedData.productPrice = Number(updatedData.productPrice)
    }

    const formData = new FormData()
    for (const key in updatedData) {
      if (key === "productAttributes") {
        formData.append(key, JSON.stringify(updatedData[key]))
      } else {
        formData.append(key, updatedData[key])
      }
    }

    if (removedImages.length > 0) {
      formData.append("removedImages", JSON.stringify(removedImages))
    }

    imageFiles.forEach((file) => {
      formData.append("productItems", file)
    })

    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/products/editProductDetails/${productId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      )
      toast.success("Product edited successfully")
      window.location.href = "/products"
      router.replace("/products")
    } catch (error) {
      console.error("Error submitting product update:", error)
      setError("Failed to update product")
      toast.error("Failed to update product")
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
          <label>Product Name</label>
          <input
            type="text"
            name="productName"
            value={formData.productName}
            onChange={handleChange}
            className="w-full border px-2 py-1"
          />
        </div>
        <div>
          <label>Price</label>
          <input
            type="text"
            name="productPrice"
            value={formData.productPrice}
            onChange={handleChange}
            className="w-full border px-2 py-1"
          />
        </div>
        <div>
          <label>Description</label>
          <textarea
            name="productDescription"
            value={formData.productDescription}
            onChange={handleChange}
            className="w-full border px-2 py-1"
          />
        </div>
        <div>
          <label>SKU</label>
          <input
            type="text"
            name="productSku"
            value={formData.productSku}
            onChange={handleChange}
            className="w-full border px-2 py-1"
          />
        </div>
        <div>
          <label>Product Weblink</label>
          <input
            type="text"
            name="productWebLink"
            value={formData.productWebLink}
            onChange={handleChange}
            className="w-full border px-2 py-1"
          />
        </div>
        <div>
          <label>Attributes</label>
          {formData.productAttributes.map((attribute, index) => (
            <div
              key={attribute._id}
              className="flex space-x-2"
            >
              <input
                type="text"
                name="attributeName"
                value={attribute.attributeName}
                onChange={(e) => handleAttributeChange(index, e)}
                placeholder="Attribute Name"
                className="w-1/2 border px-2 py-1"
                disabled
              />
              <input
                type="text"
                name="attributeValue"
                value={attribute.attributeValue}
                onChange={(e) => handleAttributeChange(index, e)}
                placeholder="Attribute Value"
                className="w-1/2 border px-2 py-1"
              />
            </div>
          ))}
        </div>

        {/* Image upload section */}
        <div>
          <label>Upload New Images</label>
          <input
            type="file"
            onChange={handleImageChange}
            multiple
            accept="image/*"
            className="w-full border px-2 py-1"
          />
        </div>

        <div>
          <Button
            type="submit"
            className="bg-[#017082] px-8 py-2 text-white"
          >
            Save Changes
          </Button>
        </div>
      </form>

      {/* Display uploaded and selected images */}
      <div className="mt-4">
        <h3>Current Images</h3>
        <div className="grid grid-cols-6 gap-2">
          {" "}
          {/* Adjusted grid for 6 columns */}
          {images.map((imageUrl, index) => {
            const correctedImageUrl = `${process.env.NEXT_PUBLIC_BASE_URL_DEV}${imageUrl.replace(/\\/g, "/")}`
            return (
              <div
                key={index}
                className="relative"
              >
                <img
                  src={`${process.env.NEXT_PUBLIC_BASE_URL_DEV}/${imageUrl.replace(/\\/g, "/").replace("v1uploads", "v1/uploads")}`}
                  alt={`Product Image ${index}`}
                  className="h-20 w-20 rounded-md object-cover" // Adjusted image size and rounded
                />
                <button
                  className="absolute right-1 top-1 rounded-full bg-white p-1 text-red-500" // Adjusted position and styling
                  onClick={() => handleImageRemove(index, true)}
                >
                  &times;
                </button>
              </div>
            )
          })}
          {imagePreviews.map((previewUrl, index) => (
            <div
              key={index}
              className="relative"
            >
              <img
                src={previewUrl}
                alt={`New Image ${index}`}
                className="h-20 w-20 rounded-md object-cover" // Adjusted image size and rounded
              />
              <button
                className="absolute right-1 top-1 rounded-full bg-white p-1 text-red-500" // Adjusted position and styling
                onClick={() => handleImageRemove(index, false)}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
