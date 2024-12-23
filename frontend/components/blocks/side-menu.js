"use client"

import React from "react"
import Link from "next/link"
import Tabs from "../elements/tabs"
import { usePathname } from "next/navigation"
import { useMenuContext } from "./menu-wrapper"
import { twMerge } from "tailwind-merge"
import { useState, useEffect } from "react"
import { getCurrentUser } from "@/contexts/query-provider/api-request-functions/api-requests"

export default function SideMenu() {
  const { isMenuExpanded } = useMenuContext()
  const [userData, setUserData] = useState({ companyName: "", userType: "" })

  useEffect(() => {
    //test
    const fetchUserData = async () => {
      try {
        const response = await getCurrentUser()
        if (response.success) {
          setUserData({
            companyName: response.data.companyName,
            userType: response.data.userType,
          })
        }
      } catch (error) {
        console.error("Error fetching user data", error)
      }
    }
    fetchUserData()
  }, [])

  return (
    <div className="flex h-[100%] flex-col justify-between">
      <Tabs>
        <Tabs.Item
          href="/"
          accessableBy={["super-admin", "company", "retailer"]}
        >
          <Link
            href="/"
            className={`group flex items-center space-x-4 ${usePathname() === "/" ? "text-white" : ""}`}
            title="dashboard"
          >
            <svg
              width="41"
              height="41"
              viewBox="0 0 41 41"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="inline-block w-10"
            >
              <rect
                className={`transition-all duration-300 ${
                  usePathname() === "/" ? "stroke-white" : "stroke-black group-hover:stroke-white"
                }`}
                x="9.5"
                y="9.1814"
                width="9"
                height="22"
                rx="1"
                stroke="black"
                strokeWidth="2.5"
              />
              <rect
                className={`transition-all duration-300 ${
                  usePathname() === "/" ? "stroke-white" : "stroke-black group-hover:stroke-white"
                }`}
                x="22.5"
                y="9.1814"
                width="9"
                height="11"
                rx="1"
                stroke="black"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <rect
                className={`transition-all duration-300 ${
                  usePathname() === "/" ? "stroke-white" : "stroke-black group-hover:stroke-white"
                }`}
                x="22.5"
                y="24.1814"
                width="9"
                height="7"
                rx="1"
                stroke="black"
                strokeWidth="2.5"
              />
            </svg>

            {isMenuExpanded && (
              <span
                className={`inline-block ${usePathname() === "/" ? "text-white" : "text-black group-hover:text-white"}`}
              >
                Dashboard
              </span>
            )}
          </Link>
        </Tabs.Item>

        <Tabs.Item
          href="/companies"
          accessableBy={["super-admin"]}
        >
          <Link
            href="/companies"
            className={`group flex items-center space-x-4 ${usePathname() === "/retailers" ? "text-white" : ""}`}
            title="companies"
          >
            <svg
              className="inline-block w-10"
              width="41"
              height="41"
              viewBox="0 0 41 41"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                className={`transition-all duration-300 ${
                  usePathname() === "/companies" ? "fill-white" : "fill-black group-hover:fill-white"
                }`}
                fillRule="evenodd"
                clipRule="evenodd"
                d="M22.9 15.3814H24.1C24.4183 15.3814 24.7235 15.255 24.9485 15.0299C25.1736 14.8049 25.3 14.4997 25.3 14.1814C25.3 13.8631 25.1736 13.5579 24.9485 13.3329C24.7235 13.1078 24.4183 12.9814 24.1 12.9814H22.9C22.5817 12.9814 22.2765 13.1078 22.0515 13.3329C21.8264 13.5579 21.7 13.8631 21.7 14.1814C21.7 14.4997 21.8264 14.8049 22.0515 15.0299C22.2765 15.255 22.5817 15.3814 22.9 15.3814ZM22.9 20.1814H24.1C24.4183 20.1814 24.7235 20.055 24.9485 19.8299C25.1736 19.6049 25.3 19.2997 25.3 18.9814C25.3 18.6631 25.1736 18.3579 24.9485 18.1329C24.7235 17.9078 24.4183 17.7814 24.1 17.7814H22.9C22.5817 17.7814 22.2765 17.9078 22.0515 18.1329C21.8264 18.3579 21.7 18.6631 21.7 18.9814C21.7 19.2997 21.8264 19.6049 22.0515 19.8299C22.2765 20.055 22.5817 20.1814 22.9 20.1814ZM16.9 15.3814H18.1C18.4183 15.3814 18.7235 15.255 18.9485 15.0299C19.1736 14.8049 19.3 14.4997 19.3 14.1814C19.3 13.8631 19.1736 13.5579 18.9485 13.3329C18.7235 13.1078 18.4183 12.9814 18.1 12.9814H16.9C16.5817 12.9814 16.2765 13.1078 16.0515 13.3329C15.8264 13.5579 15.7 13.8631 15.7 14.1814C15.7 14.4997 15.8264 14.8049 16.0515 15.0299C16.2765 15.255 16.5817 15.3814 16.9 15.3814ZM16.9 20.1814H18.1C18.4183 20.1814 18.7235 20.055 18.9485 19.8299C19.1736 19.6049 19.3 19.2997 19.3 18.9814C19.3 18.6631 19.1736 18.3579 18.9485 18.1329C18.7235 17.9078 18.4183 17.7814 18.1 17.7814H16.9C16.5817 17.7814 16.2765 17.9078 16.0515 18.1329C15.8264 18.3579 15.7 18.6631 15.7 18.9814C15.7 19.2997 15.8264 19.6049 16.0515 19.8299C16.2765 20.055 16.5817 20.1814 16.9 20.1814ZM31.3 29.7814H30.1V9.3814C30.1 9.06314 29.9736 8.75791 29.7485 8.53287C29.5235 8.30782 29.2183 8.1814 28.9 8.1814H12.1C11.7817 8.1814 11.4765 8.30782 11.2515 8.53287C11.0264 8.75791 10.9 9.06314 10.9 9.3814V29.7814H9.7C9.38174 29.7814 9.07652 29.9078 8.85147 30.1329C8.62643 30.3579 8.5 30.6631 8.5 30.9814C8.5 31.2997 8.62643 31.6049 8.85147 31.8299C9.07652 32.055 9.38174 32.1814 9.7 32.1814H31.3C31.6183 32.1814 31.9235 32.055 32.1485 31.8299C32.3736 31.6049 32.5 31.2997 32.5 30.9814C32.5 30.6631 32.3736 30.3579 32.1485 30.1329C31.9235 29.9078 31.6183 29.7814 31.3 29.7814ZM21.7 29.7814H19.3V24.9814H21.7V29.7814ZM27.7 29.7814H24.1V23.7814C24.1 23.4631 23.9736 23.1579 23.7485 22.9329C23.5235 22.7078 23.2183 22.5814 22.9 22.5814H18.1C17.7817 22.5814 17.4765 22.7078 17.2515 22.9329C17.0264 23.1579 16.9 23.4631 16.9 23.7814V29.7814H13.3V10.5814H27.7V29.7814Z"
                fill="black"
              />
            </svg>

            {isMenuExpanded && (
              <span
                className={`inline-block ${
                  usePathname() === "/companies" ? "text-white" : "text-black group-hover:text-white"
                }`}
              >
                Companies
              </span>
            )}
          </Link>
        </Tabs.Item>

        <Tabs.Item
          href="/products"
          accessableBy={["super-admin", "company", "retailer"]}
        >
          <Link
            href="/products"
            className={`group flex items-center space-x-4 ${usePathname() === "/products" ? "text-white" : ""}`}
            title="products"
          >
            <svg
              width="41"
              height="41"
              viewBox="0 0 41 41"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                className={`transition-all duration-300 ${
                  usePathname() === "/products" ? "fill-white" : "fill-black group-hover:fill-white"
                }`}
                d="M31.2809 13.5722H10.5943C10.3147 13.5722 10.035 13.5696 9.75543 13.5722H9.71896C10.0059 14.3116 10.2928 15.0485 10.5797 15.7879L12.1844 13.9665C13.0379 12.9988 13.8913 12.0336 14.7423 11.0658C14.9368 10.8453 15.1338 10.6222 15.3283 10.4016C15.0414 10.5288 14.7545 10.6559 14.4675 10.7804H25.054C25.5403 10.7804 26.0266 10.7882 26.5129 10.7804H26.5347C26.2478 10.6533 25.9609 10.5262 25.674 10.4016L27.2788 12.223C28.1322 13.1908 28.9856 14.1559 29.8366 15.1237C30.0312 15.3442 30.2281 15.5674 30.4226 15.7879C30.6317 16.0266 30.9794 16.1667 31.2833 16.1667C31.5824 16.1667 31.9374 16.0266 32.1441 15.7879C32.3556 15.5414 32.5136 15.2171 32.4991 14.8694C32.4845 14.5192 32.3702 14.2104 32.1441 13.951C31.6602 13.4035 31.1788 12.8561 30.6949 12.3086C29.8707 11.3746 29.0489 10.4406 28.2246 9.50912C27.979 9.22891 27.731 8.95129 27.4854 8.67108C27.235 8.38568 26.9238 8.19368 26.5323 8.1859H14.8371C14.6183 8.1859 14.3533 8.15996 14.1442 8.2326C13.726 8.3779 13.495 8.69443 13.2105 9.01615C12.4446 9.88273 11.6811 10.7493 10.9152 11.6185C10.2636 12.3579 9.61197 13.0948 8.96035 13.8342C8.92631 13.8731 8.88984 13.9147 8.8558 13.9536C8.51783 14.3376 8.41085 14.8824 8.60536 15.3702C8.79258 15.8398 9.22781 16.1667 9.71652 16.1667H30.4032C30.6828 16.1667 30.9624 16.1693 31.242 16.1667H31.2785C31.5897 16.1667 31.9179 16.0214 32.1392 15.7879C32.3507 15.5622 32.5088 15.1938 32.4942 14.8694C32.4796 14.5347 32.3775 14.1871 32.1392 13.951C31.9034 13.7201 31.6116 13.5722 31.2809 13.5722Z"
                fill="black"
              />
              <path
                className={`transition-all duration-300 ${
                  usePathname() === "/products" ? "fill-white" : "fill-black group-hover:fill-white"
                }`}
                d="M30.0652 14.8668V28.9163C30.0652 29.5623 30.0579 30.211 30.0652 30.857V30.883L31.2809 29.5857H10.5943C10.3147 29.5857 10.035 29.5831 9.75543 29.5857H9.71896L10.9347 30.883V16.8335C10.9347 16.1875 10.942 15.5388 10.9347 14.8928V14.8668L9.71896 16.1641H30.4056C30.6852 16.1641 30.9648 16.1667 31.2444 16.1641H31.2809C31.5921 16.1641 31.9204 16.0188 32.1416 15.7853C32.3532 15.5596 32.5112 15.1912 32.4966 14.8668C32.482 14.5321 32.3799 14.1845 32.1416 13.9484C31.9034 13.7149 31.6116 13.5696 31.2809 13.5696H10.5943C10.3147 13.5696 10.035 13.567 9.75543 13.5696H9.71896C9.06247 13.5696 8.50324 14.1637 8.50324 14.8668V28.9163C8.50324 29.5623 8.49595 30.211 8.50324 30.857V30.883C8.50324 31.5835 9.06004 32.1802 9.71896 32.1802H30.4056C30.6852 32.1802 30.9648 32.1828 31.2444 32.1802H31.2809C31.9374 32.1802 32.4966 31.5861 32.4966 30.883V16.8335C32.4966 16.1875 32.5039 15.5388 32.4966 14.8928V14.8668C32.4966 14.5347 32.3605 14.1845 32.1416 13.9484C31.9301 13.7227 31.5848 13.554 31.2809 13.5696C30.9673 13.5851 30.6414 13.6941 30.4202 13.9484C30.2038 14.2052 30.0652 14.5166 30.0652 14.8668Z"
                fill="black"
              />
              <path
                className={`transition-all duration-300 ${
                  usePathname() === "/products" ? "fill-white" : "fill-black group-hover:fill-white"
                }`}
                d="M21.9661 14.8668V21.9811C22.5764 21.6075 23.1867 21.2339 23.7945 20.8602C22.9921 20.4114 22.1898 19.9625 21.385 19.5137C21.2829 19.4566 21.1807 19.3969 21.0762 19.3398C20.8865 19.2386 20.6799 19.1504 20.461 19.1608C20.2373 19.1712 20.0477 19.2283 19.8459 19.3372C19.8361 19.3424 19.8264 19.3476 19.8167 19.3554C19.7632 19.3865 19.7073 19.4151 19.6538 19.4462C19.187 19.7083 18.7201 19.9677 18.2533 20.2298C17.8788 20.4399 17.5044 20.6501 17.1275 20.8576C17.7378 21.2313 18.3481 21.6049 18.956 21.9785V14.8642L17.7403 16.1615H23.1794C23.4906 16.1615 23.8188 16.0162 24.0401 15.7827C24.2516 15.557 24.4097 15.1886 24.3951 14.8642C24.3805 14.5296 24.2784 14.1819 24.0401 13.9458C23.8018 13.7123 23.51 13.567 23.1794 13.567H17.7403C17.0838 13.567 16.5245 14.1611 16.5245 14.8642V21.9785C16.5245 22.4351 16.758 22.8684 17.1275 23.0993C17.5166 23.3432 17.9639 23.3173 18.3554 23.0993C19.1481 22.6557 19.9431 22.212 20.7358 21.7683C20.8501 21.7061 20.9619 21.6412 21.0762 21.5789H19.8483C20.641 22.0226 21.436 22.4663 22.2287 22.9099C22.343 22.9722 22.4548 23.0371 22.5691 23.0993C22.9581 23.3173 23.4079 23.3432 23.797 23.0993C24.1665 22.8684 24.3999 22.4377 24.3999 21.9785V14.8642C24.3999 14.5321 24.2638 14.1819 24.045 13.9458C23.8334 13.7201 23.4882 13.5514 23.1842 13.567C22.8706 13.5825 22.5448 13.6915 22.3235 13.9458C22.1047 14.2052 21.9661 14.5166 21.9661 14.8668Z"
                fill="black"
              />
            </svg>

            {isMenuExpanded && (
              <span
                className={`inline-block ${
                  usePathname() === "/products" ? "text-white" : "text-black group-hover:text-white"
                }`}
              >
                Products
              </span>
            )}
          </Link>
        </Tabs.Item>
      </Tabs>

      {/* Displaying companyName and userType at the bottom */}
      {isMenuExpanded && (
        <div className="mb-10 mt-auto w-full">
          <div className="w-full rounded bg-[#02235E] p-4 text-center">
            <p className="text-lg text-white"> {userData.companyName}</p>
            <p className="text-sm text-white"> {userData.userType}</p>
          </div>
        </div>
      )}
    </div>
  )
}
