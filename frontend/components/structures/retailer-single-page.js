"use client"

import React from "react"
import Button from "../elements/button"
import { useRouter } from "next/navigation"

export default function RetailerSinglePage({ params }) {
  const router = useRouter()

  return (
    <div className="space-y-6">
      <h2 className="text-center text-3xl font-bold text-[#3f3f3f]">Oliz Store</h2>

      <div className="space-y-4 rounded-sm border-2 border-[#d2d2d2] bg-white p-10">
        <div className="flex gap-8 border-b-2 border-[#d2d2d2] py-6">
          <div className="min-w-[300px] px-4 font-bold">
            <span>Full Name:</span>
          </div>
          <div className="px-4 text-[#7f7f7f]">
            <span>James Mid Olsen</span>
          </div>
        </div>

        <div className="flex gap-8 border-b-2 border-[#d2d2d2] py-6">
          <div className="min-w-[300px] px-4 font-bold">
            <span>Retailer Name:</span>
          </div>
          <div className="px-4 text-[#7f7f7f]">
            <span>Oliz Store</span>
          </div>
        </div>

        <div className="flex gap-8 border-b-2 border-[#d2d2d2] py-6">
          <div className="min-w-[300px] px-4 font-bold">
            <span>User Type:</span>
          </div>
          <div className="px-4 text-[#7f7f7f]">
            <span>Company</span>
          </div>
        </div>

        <div className="flex gap-8 border-b-2 border-[#d2d2d2] py-6">
          <div className="min-w-[300px] px-4 font-bold">
            <span>Product Type:</span>
          </div>
          <div className="px-4 text-[#7f7f7f]">
            <span>Watch</span>
          </div>
        </div>

        <div className="flex gap-8 border-b-2 border-[#d2d2d2] py-6">
          <div className="min-w-[300px] px-4 font-bold">
            <span>Address:</span>
          </div>

          <div className="space-x-16 px-4 text-[#7f7f7f]">
            <div className="inline-block space-y-4">
              <div className="font-bold text-black">
                <span>Country:</span>
              </div>
              <div className="">
                <span>United States</span>
              </div>
            </div>

            <div className="inline-block space-y-4">
              <div className="font-bold text-black">
                <span>State:</span>
              </div>
              <div className="">
                <span>California</span>
              </div>
            </div>

            <div className="inline-block space-y-4">
              <div className="font-bold text-black">
                <span>Postal / Zip Code:</span>
              </div>
              <div className="">
                <span>90213</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-8 border-b-2 border-[#d2d2d2] py-6">
          <div className="min-w-[300px] px-4 font-bold">
            <span>Phone Number:</span>
          </div>
          <div className="px-4 text-[#7f7f7f]">
            <span>9801234567</span>
          </div>
        </div>

        <div className="flex gap-8 border-b-2 border-[#d2d2d2] py-6">
          <div className="min-w-[300px] px-4 font-bold">
            <span>Email:</span>
          </div>
          <div className="px-4 text-[#7f7f7f]">
            <span>myemail@example.com</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          className="bg-[#017082] px-16 py-4 text-white"
          onClick={() => router.push(`/retailers/single-retailer/edit`)}
        >
          Edit Profile
        </Button>

        <Button
          className="bg-[#017082] px-16 py-4 text-white"
          onClick={() => router.push(`/retailers/single-retailer/edit`)}
        >
          View Products
        </Button>
      </div>
    </div>
  )
}
