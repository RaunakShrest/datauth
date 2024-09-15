"use client"

import { useQuery } from "@tanstack/react-query"
import React from "react"
import { getCurrentUser } from "../query-provider/api-request-functions/api-requests"
import { reactQueryStaleTime } from "@/utils/staticUtils"
import LoadingAnimation from "@/components/composites/loading-animation"
import { redirect } from "next/navigation"

export default function RequireRole({ roles = [], children }) {
  const currentUser = useQuery({
    queryKey: ["signedInUser"],
    queryFn: () => getCurrentUser(),
    staleTime: reactQueryStaleTime,
  })

  if (currentUser.isPending) {
    return (
      <div>
        <LoadingAnimation />
      </div>
    )
  }

  if (!currentUser.isPending && !currentUser.data?.success) {
    redirect("/login")
  }

  if (!roles.includes(currentUser.data?.data.userType)) {
    return redirect("/no-permission")
  }

  return <>{children}</>
}
