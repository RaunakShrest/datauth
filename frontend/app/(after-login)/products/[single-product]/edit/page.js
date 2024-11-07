"use client"

import EditSingleProductForm from "@/components/structures/edit-product-form"
import EditSingleProductProvider from "@/contexts/edit-single-product-form.js"

import { useParams } from "next/navigation"
import React from "react"

export default function EditSingleProduct() {
  const params = useParams()

  return (
    <div>
      <EditSingleProductProvider>
        <EditSingleProductForm params={params} />
      </EditSingleProductProvider>
    </div>
  )
}

// const router = useRouter()

// const singleProductQuery = useQuery({
//   queryKey: ["fetchSinglProduct", params["single-product"]],
//   queryFn: () => fetchSingleProduct(params["single-product"]),
//   staleTime: reactQueryStaleTime,
// })
// const currentUser = useQuery({
//   queryKey: ["signedInUser"],
//   queryFn: () => getCurrentUser(),
//   staleTime: reactQueryStaleTime,
// })

// if (currentUser.isPending || singleProductQuery.isPending) {
//   return (
//     <div className="h-[200px] text-center">
//       <LoadingAnimation />
//     </div>
//   )
// }
