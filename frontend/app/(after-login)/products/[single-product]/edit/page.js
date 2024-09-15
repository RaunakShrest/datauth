"use client"

import LoadingAnimation from "@/components/composites/loading-animation"
import EditSingleProductForm from "@/components/structures/edit-product-form"
import { fetchSingleProduct, getCurrentUser } from "@/contexts/query-provider/api-request-functions/api-requests"
import { reactQueryStaleTime } from "@/utils/staticUtils"
import { useQuery } from "@tanstack/react-query"
import { redirect, useParams, useRouter } from "next/navigation"
import React from "react"

export default function EditSingleProduct() {
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

  if (
    !currentUser.isPending &&
    !singleProductQuery.isPending &&
    currentUser.data?.data._id !== singleProductQuery.data?.data.productManufacturer._id
  ) {
    redirect("/no-permission")
  }

  return <EditSingleProductForm />
}
