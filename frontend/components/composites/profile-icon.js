"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ImgWithWrapper from "./img-with-wrapper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { getCurrentUser, signOutUser } from "@/contexts/query-provider/api-request-functions/api-requests";
import axios from "axios";
import ContextMenu from "../blocks/context-menu";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function ProfileIcon() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    companyName: "",
    address: {
      zip: "",
      city: "",
      country: "",
      addressLine: "",
    },
  });

  // Fetch current user details
  const currentUserQuery = useQuery({
    queryKey: ["signedInUser"],
    queryFn: () => getCurrentUser(),
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 0,
  });

  // Populate form data once the user data is available and fetched successfully
  useEffect(() => {
    if (currentUserQuery.isSuccess && currentUserQuery.data) {
      const userData = currentUserQuery.data.data;
      setFormData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        phoneNumber: userData.phoneNumber || "",
        companyName: userData.companyName || "",
        address: userData.address || {
          zip: "",
          city: "",
          country: "",
          addressLine: "",
        },
      });
    }
  }, [currentUserQuery.data, currentUserQuery.isSuccess]);

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

  // Handle file input change for profile picture and upload immediately
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);

    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setImagePreviewUrl(fileUrl);

      try {
        const formData = new FormData();
        formData.append("file", file);

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
          toast.success("Profile picture updated successfully.");
          queryClient.invalidateQueries({ queryKey: ["signedInUser"] });
        }
      } catch (error) {
        toast.error("Error uploading profile picture.");
      }
    }
  };

  // Handle form data change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle address change
  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      address: {
        ...prevData.address,
        [name]: value,
      },
    }));
  };

  // Handle form submission for updating user profile
  const handleProfileUpdate = async () => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      toast.error("Access token is missing. Please log in again.");
      return;
    }

    try {
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/users/edit-profile`,
        {
          userId: currentUserQuery.data.data._id,
          ...formData,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Profile updated successfully.");
        queryClient.invalidateQueries({ queryKey: ["signedInUser"] });
        setIsModalOpen(false);
      }
    } catch (error) {
      toast.error("Error updating profile.");
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
    <div className="relative bg-white p-8 rounded-lg shadow-lg max-w-md w-full transition-all duration-300 transform scale-95 hover:scale-100">
      <h2 className="text-xl font-semibold mb-6 text-center">Profile</h2>

      {/* Close Button */}
      <button
        onClick={() => setIsModalOpen(false)}
        className="absolute top-4 right-4 text-red-500 hover:text-gray-700 px-2 text-2xl"
        aria-label="Close"
      >
        &times;
      </button>

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

      {/* Form Inputs */}
      <div className="mb-4">
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="First Name"
          className="block w-full mb-2 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring focus:ring-blue-500"
        />
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Last Name"
          className="block w-full mb-2 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring focus:ring-blue-500"
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email"
          className="block w-full mb-2 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring focus:ring-blue-500"
        />
        <input
          type="text"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
          placeholder="Phone Number"
          className="block w-full mb-2 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring focus:ring-blue-500"
        />
        <input
          type="text"
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          placeholder="Company Name"
          className="block w-full mb-2 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring focus:ring-blue-500"
        />
      </div>

      <h3 className="text-lg font-semibold mb-2">Address</h3>
      <input
        type="text"
        name="addressLine"
        value={formData.address.addressLine}
        onChange={handleAddressChange}
        placeholder="Address Line"
        className="block w-full mb-2 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring focus:ring-blue-500"
      />
      <div className="flex mb-2 gap-4">
        <input
          type="text"
          name="zip"
          value={formData.address.zip}
          onChange={handleAddressChange}
          placeholder="Zip"
          className="block w-1/2 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring focus:ring-blue-500"
        />
        <input
          type="text"
          name="city"
          value={formData.address.city}
          onChange={handleAddressChange}
          placeholder="City"
          className="block w-1/2 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring focus:ring-blue-500"
        />
      </div>
      <input
        type="text"
        name="country"
        value={formData.address.country}
        onChange={handleAddressChange}
        placeholder="Country"
        className="block w-full mb-4 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring focus:ring-blue-500"
      />
      
      {/* Button Container */}
      <div className="flex justify-center mt-4">
        <button
          onClick={handleProfileUpdate}
          className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700"
        >
          Update Profile
        </button>
      </div>
    </div>
  </div>
)}


    </>
  );
}
