"use client"

import { fetchSingleProduct } from "@/contexts/query-provider/api-request-functions/api-requests"
import { reactQueryStaleTime } from "@/utils/staticUtils"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import React, { useState } from "react"
import { currencyFormat } from "@/utils/functionalUtils"
import LoadingAnimation from "../composites/loading-animation"

export default function ViewSingleProduct() {
  const params = useParams()

  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const singleProductQuery = useQuery({
    queryKey: ["fetchSinglProduct", params["single-product"]],
    queryFn: () => fetchSingleProduct(params["single-product"]),
    staleTime: reactQueryStaleTime,
  })

  const currentUser = useQuery({
    queryKey: ["signedInUser"],
    queryFn: () => getCurrentUser(),
    staleTime: reactQueryStaleTime,
  })

  if (currentUser.isPending || singleProductQuery.isPending) {
    return (
      <div className="h-[200px] text-center">
        <LoadingAnimation />
      </div>
    )
  }

  const productData = singleProductQuery.data?.data
  const productImages = productData?.productImages || []

  // Ensure that productImages is not empty and the index is valid
  const currentImage =
    productImages.length > 0 && productImages[currentImageIndex]
      ? `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/${productImages[currentImageIndex].replace(/\\/g, "/")}`
      : null

  // Function to handle slider navigation
  const handlePrevImage = () => {
    if (productImages.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + productImages.length) % productImages.length)
    }
  }

  const handleNextImage = () => {
    if (productImages.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % productImages.length)
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-3xl font-bold">
        <span>{productData?.productName}</span>
      </div>

      {/* Conditionally render image slider if there are images */}
      {productImages.length > 0 && (
        <div className="flex justify-center items-center space-x-4">
          {/* Left Arrow */}
          <button
            onClick={handlePrevImage}
            className="bg-gray-300 p-2 rounded-full"
          >
            &#8592; {/* Left Arrow */}
          </button>

          {/* Product Image */}
          <img
            src={currentImage}
            alt={`Product image ${currentImageIndex + 1}`}
            className="object-cover w-1/3 h-[500px] rounded-md"
          />

          {/* Right Arrow */}
          <button
            onClick={handleNextImage}
            className="bg-gray-300 p-2 rounded-full"
          >
            &#8594; {/* Right Arrow */}
          </button>
        </div>
      )}

      <div className="text-right">
        <span className="text-xl font-bold">{currencyFormat(productData?.productPrice)}</span>
      </div>

      <div className="flex gap-4">
        <div className="flex w-1/2 justify-between bg-white p-8">
          <div>
            <p className="font-bold">Product Type</p>
            <p className="text-[#7f7f7f]">{productData?.productType.name}</p>
          </div>

          <div>
            <p className="font-bold">Product Status</p>
            <p className="text-[#7f7f7f]">{productData?.productStatus}</p>
          </div>
        </div>

        <div className="flex w-1/2 justify-between bg-white p-8">
          <div>
            <p className="font-bold">Product SKU</p>
            <p className="text-[#7f7f7f]">{productData?.productSku}</p>
          </div>
          <div>
            <p className="font-bold">Batch Id</p>
            <p className="text-[#7f7f7f]">{productData?.batchId}</p>
          </div>
          <div>
            <p className="font-bold">Manufacturer</p>
            <p className="text-[#7f7f7f]">{productData?.productManufacturer.companyName}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 bg-white px-8 py-8">
        <p className="text-lg font-bold">Detailed Description</p>
        <p
          className="text-[#7f7f7f]"
          dangerouslySetInnerHTML={{ __html: productData?.productDescription }}
        ></p>
      </div>

      <div className="space-y-4 bg-white px-8 py-8">
        <div>
          <span className="text-lg font-bold">Product Attributes</span>
        </div>
        {productData?.productAttributes.map((eachAttribute) => (
          <div className="flex gap-4" key={eachAttribute._id}>
            <p className="w-52 font-bold">{eachAttribute.attributeName}</p>
            <p className="text-[#7f7f7f]">{eachAttribute.attributeValue}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
