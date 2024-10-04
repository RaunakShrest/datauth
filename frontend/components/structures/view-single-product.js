"use client"

import { fetchSingleProduct } from "@/contexts/query-provider/api-request-functions/api-requests"
import { reactQueryStaleTime } from "@/utils/staticUtils"
import { useQuery } from "@tanstack/react-query"
import { redirect, useParams, useRouter } from "next/navigation"
import React from "react"
import ImgWithWrapper from "../composites/img-with-wrapper"
import { currencyFormat } from "@/utils/functionalUtils"
import Button from "../elements/button"
import LoadingAnimation from "../composites/loading-animation"

export default function ViewSingleProduct() {
  const params = useParams()
  const router = useRouter()

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

  /* if (!currentUser.isPending && !singleProductQuery.isPending) {
    redirect("/no-permission")
  } */

  return (
    <div className="space-y-4">
      <div className="text-3xl font-bold">
        <span>{singleProductQuery.data?.data.productName}</span>
      </div>

      <div>
        <ImgWithWrapper
          imageAttributes={{ src: "/assets/product-image.png", alt: "product-image" }}
          wrapperClassName="w-full h-[400px] bg-white"
          imageClassName="object-contain"
        />
      </div>

      <div className="text-right">
        <span className="text-xl font-bold">{currencyFormat(singleProductQuery.data?.data.productPrice)}</span>
      </div>

      <div className="flex gap-4">
        <div className="flex w-1/2 justify-between bg-white p-8">
          <div>
            <p className="font-bold">Product Type</p>
            <p className="text-[#7f7f7f]">{singleProductQuery.data?.data.productType.name}</p>
          </div>

          <div>
            <p className="font-bold">Product Status</p>
            <p className="text-[#7f7f7f]">{singleProductQuery.data?.data.productStatus}</p>
          </div>
        </div>

        <div className="flex w-1/2 justify-between bg-white p-8">
          <div>
            <p className="font-bold">Product SKU</p>
            <p className="text-[#7f7f7f]">{singleProductQuery.data?.data.productSku}</p>
          </div>
   <div>
            <p className="font-bold">Batch Id</p>
            <p className="text-[#7f7f7f]">{singleProductQuery.data?.data.batchId}</p>
          </div>
          <div>
            <p className="font-bold">Manufacturer</p>
            <p className="text-[#7f7f7f]">{singleProductQuery.data?.data.productManufacturer.companyName}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 bg-white px-8 py-8">
        <p className="text-lg font-bold">Detailed Description</p>

        <p
          className="text-[#7f7f7f]"
          dangerouslySetInnerHTML={{ __html: singleProductQuery.data?.data.productDescription }}
        ></p>
      </div>

      <div className="space-y-4 bg-white px-8 py-8">
        <div>
          <span className="text-lg font-bold">Product Attributes</span>
        </div>
        {singleProductQuery.data?.data.productAttributes.map((eachAttribute) => (
          <div
            className="flex gap-4"
            key={eachAttribute._id}
          >
            <p className="w-52 font-bold">{eachAttribute.attributeName}</p>
            <p className="text-[#7f7f7f]">{eachAttribute.attributeValue}</p>
          </div>
        ))}
      </div>

      <div className="text-right">
        <Button
          className="bg-[#017082] px-8 py-2 text-white"
          onClick={() => router.push(`/products/${params["single-product"]}/edit`)}
        >
          Edit Product
        </Button>
      </div>
    </div>
  )
}
