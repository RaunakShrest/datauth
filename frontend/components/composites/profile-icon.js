"use client"

import React from "react"
import ImgWithWrapper from "./img-with-wrapper"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCaretDown } from "@fortawesome/free-solid-svg-icons"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getCurrentUser, signOutUser } from "@/contexts/query-provider/api-request-functions/api-requests"
import { reactQueryStaleTime } from "@/utils/staticUtils"
import ContextMenu from "../blocks/context-menu"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

export default function ProfileIcon() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const logoutMutation = useMutation({
    mutationFn: () => signOutUser(),
    onSuccess: (response) => {
      toast.success(response.message)

      queryClient.clear()
      router.push("/login")

      return
    },
    onError: (error) => {
      toast.error(error.data.message)

      queryClient.clear()

      return
    },
  })

  const currentUser = useQuery({
    queryKey: ["signedInUser"],
    queryFn: () => getCurrentUser(),
    staleTime: reactQueryStaleTime,
  })

  return (
    <ContextMenu className="relative">
      <ContextMenu.Trigger className="p-0">
        <div className="flex items-center gap-2">
          <ImgWithWrapper
            wrapperClassName="size-16 rounded-full overflow-hidden"
            imageAttributes={{
              src: !currentUser.isPending
                ? (currentUser.data?.user?.imageUrl ?? "/assets/no-profile-picture.png")
                : "/assets/no-profile-picture.png",
              alt: "profile_picture",
            }}
          />

          <FontAwesomeIcon
            icon={faCaretDown}
            className="text-2xl"
          />
        </div>
      </ContextMenu.Trigger>

      <ContextMenu.Menu className="absolute right-0 top-full w-[175px] rounded-md bg-white p-2">
        <ContextMenu.Item>View Profile</ContextMenu.Item>
        <ContextMenu.Item
          className="rounded-md bg-red-600 text-white"
          onClick={() => logoutMutation.mutate()}
        >
          Logout
        </ContextMenu.Item>
      </ContextMenu.Menu>
    </ContextMenu>
  )
}
