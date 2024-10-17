"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ImgWithWrapper from "./img-with-wrapper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import {
  getCurrentUser,
  signOutUser,
} from "@/contexts/query-provider/api-request-functions/api-requests";
import axios from "axios"; // Import axios
import ContextMenu from "../blocks/context-menu";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ProfileIcon() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  // Fetch current user details
  const currentUserQuery = useQuery({
    queryKey: ["signedInUser"],
    queryFn: () => getCurrentUser(),
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 0,
  });

  const logoutMutation = useMutation({
    mutationFn: () => signOutUser(),
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.clear();
      router.push("/login");
    },
    onError: (error) => {
      toast.error(error.data.message);
      queryClient.clear();
    },
  });

  // Handle file input change for profile picture
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);

    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setImagePreviewUrl(fileUrl);
    }
  };

  // Handle profile picture upload
  const handleUpload = async () => {
    if (selectedFile) {
      try {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
          toast.error("Access token is missing. Please log in again.");
          return;
        }

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/users/upload-profile-picture`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.status === 200) {
          toast.success("Profile picture uploaded successfully.");
          queryClient.invalidateQueries({ queryKey: ["signedInUser"] });
          setIsModalOpen(false);
        }
      } catch (error) {
        toast.error("Error uploading profile picture.");
      }
    } else {
      toast.error("Please select a file to upload.");
    }
  };

  const profilePicPath = currentUserQuery?.data?.data?.profilePic;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL_DEV;

  const imageUrl = profilePicPath
    ? `${baseUrl}/${profilePicPath.replace(/\\/g, "/")}?t=${new Date().getTime()}`
    : "/assets/no-profile-picture.png";

  if (currentUserQuery.isError) {
    toast.error("Error fetching user data");
    router.push("/login");
    return null;
  }

  return (
    <>
      <ContextMenu className="relative">
        <ContextMenu.Trigger className="p-0">
          <div className="flex items-center gap-2">
            <ImgWithWrapper
              wrapperClassName="size-16 rounded-full overflow-hidden"
              imageAttributes={{
                src: !currentUserQuery.isFetching
                  ? imageUrl
                  : "/assets/no-profile-picture.png",
                alt: "profile_picture",
              }}
            />
            <FontAwesomeIcon icon={faCaretDown} className="text-2xl" />
          </div>
        </ContextMenu.Trigger>

        <ContextMenu.Menu className="absolute right-0 top-full w-[175px] rounded-md bg-white p-2">
          <ContextMenu.Item onClick={() => setIsModalOpen(true)}>
            View Profile
          </ContextMenu.Item>
          <ContextMenu.Item
            className="rounded-md bg-red-600 text-white"
            onClick={() => logoutMutation.mutate()}
          >
            Logout
          </ContextMenu.Item>
        </ContextMenu.Menu>
      </ContextMenu>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full transition-all duration-300 transform scale-95 hover:scale-100">
            <h2 className="text-xl font-semibold mb-6 text-center">Profile</h2>

            <div className="flex flex-col items-center mb-4">
              <ImgWithWrapper
                wrapperClassName="size-32 rounded-full overflow-hidden mb-4 border border-gray-200"
                imageAttributes={{
                  src: imagePreviewUrl || imageUrl,
                  alt: "profile_picture",
                }}
              />

              <input
                type="file"
                onChange={handleFileChange}
                className="block w-full mb-4 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleUpload}
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300 w-full mb-2"
            >
              Upload
            </button>

            <button
              onClick={() => setIsModalOpen(false)}
              className="text-red-500 w-full py-2 px-4 rounded-md hover:bg-red-100 transition duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
