"use client"

import React from "react"
import Link from "next/link"
import Tabs from "../elements/tabs"
import { useMenuContext } from "./menu-wrapper"
import { twMerge } from "tailwind-merge"
import { useState, useEffect } from "react"
import { getCurrentUser } from "@/contexts/query-provider/api-request-functions/api-requests"

export default function SideMenu() {
  const { isMenuExpanded } = useMenuContext()
  const [userData, setUserData] = useState({ companyName: "", userType: "" })

  useEffect(() => {
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
            className="flex items-center space-x-4"
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
                x="9.5"
                y="9.1814"
                width="9"
                height="22"
                rx="1"
                stroke="black"
                stroke-width="2.5"
              />
              <rect
                x="22.5"
                y="9.1814"
                width="9"
                height="11"
                rx="1"
                stroke="black"
                stroke-width="2.5"
                stroke-linejoin="round"
              />
              <rect
                x="22.5"
                y="24.1814"
                width="9"
                height="7"
                rx="1"
                stroke="black"
                stroke-width="2.5"
              />
            </svg>

            {isMenuExpanded && <span className="inline-block text-black">Dashboard</span>}
          </Link>
        </Tabs.Item>

        <Tabs.Item
          href="/product-types"
          accessableBy={["super-admin", "company"]}
        >
          <Link
            href="/product-types"
            className="flex items-center space-x-4"
            title="product types"
          >
            <svg
              width="41"
              height="41"
              viewBox="0 0 41 41"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="inline-block w-10"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M25.6426 8.1814H29.5625C31.1843 8.1814 32.5 9.50847 32.5 11.1456V15.0983C32.5 16.7342 31.1843 18.0625 29.5625 18.0625H25.6426C24.0196 18.0625 22.7039 16.7342 22.7039 15.0983V11.1456C22.7039 9.50847 24.0196 8.1814 25.6426 8.1814ZM11.4387 8.1814H15.3574C16.9804 8.1814 18.2961 9.50847 18.2961 11.1456V15.0983C18.2961 16.7342 16.9804 18.0625 15.3574 18.0625H11.4387C9.81565 18.0625 8.5 16.7342 8.5 15.0983V11.1456C8.5 9.50847 9.81565 8.1814 11.4387 8.1814ZM11.4387 22.3003H15.3574C16.9804 22.3003 18.2961 23.6273 18.2961 25.2657V29.2172C18.2961 30.8543 16.9804 32.1814 15.3574 32.1814H11.4387C9.81565 32.1814 8.5 30.8543 8.5 29.2172V25.2657C8.5 23.6273 9.81565 22.3003 11.4387 22.3003ZM25.6426 22.3003H29.5625C31.1843 22.3003 32.5 23.6273 32.5 25.2657V29.2172C32.5 30.8543 31.1843 32.1814 29.5625 32.1814H25.6426C24.0196 32.1814 22.7039 30.8543 22.7039 29.2172V25.2657C22.7039 23.6273 24.0196 22.3003 25.6426 22.3003Z"
                stroke="black"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>

            {isMenuExpanded && <span className="inline-block text-black">Product Types</span>}
          </Link>
        </Tabs.Item>

        <Tabs.Item
          href="/companies"
          accessableBy={["super-admin", "retailer"]}
        >
          <Link
            href="/companies"
            className="flex items-center space-x-4"
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
                fillRule="evenodd"
                clipRule="evenodd"
                d="M22.9 15.3814H24.1C24.4183 15.3814 24.7235 15.255 24.9485 15.0299C25.1736 14.8049 25.3 14.4997 25.3 14.1814C25.3 13.8631 25.1736 13.5579 24.9485 13.3329C24.7235 13.1078 24.4183 12.9814 24.1 12.9814H22.9C22.5817 12.9814 22.2765 13.1078 22.0515 13.3329C21.8264 13.5579 21.7 13.8631 21.7 14.1814C21.7 14.4997 21.8264 14.8049 22.0515 15.0299C22.2765 15.255 22.5817 15.3814 22.9 15.3814ZM22.9 20.1814H24.1C24.4183 20.1814 24.7235 20.055 24.9485 19.8299C25.1736 19.6049 25.3 19.2997 25.3 18.9814C25.3 18.6631 25.1736 18.3579 24.9485 18.1329C24.7235 17.9078 24.4183 17.7814 24.1 17.7814H22.9C22.5817 17.7814 22.2765 17.9078 22.0515 18.1329C21.8264 18.3579 21.7 18.6631 21.7 18.9814C21.7 19.2997 21.8264 19.6049 22.0515 19.8299C22.2765 20.055 22.5817 20.1814 22.9 20.1814ZM16.9 15.3814H18.1C18.4183 15.3814 18.7235 15.255 18.9485 15.0299C19.1736 14.8049 19.3 14.4997 19.3 14.1814C19.3 13.8631 19.1736 13.5579 18.9485 13.3329C18.7235 13.1078 18.4183 12.9814 18.1 12.9814H16.9C16.5817 12.9814 16.2765 13.1078 16.0515 13.3329C15.8264 13.5579 15.7 13.8631 15.7 14.1814C15.7 14.4997 15.8264 14.8049 16.0515 15.0299C16.2765 15.255 16.5817 15.3814 16.9 15.3814ZM16.9 20.1814H18.1C18.4183 20.1814 18.7235 20.055 18.9485 19.8299C19.1736 19.6049 19.3 19.2997 19.3 18.9814C19.3 18.6631 19.1736 18.3579 18.9485 18.1329C18.7235 17.9078 18.4183 17.7814 18.1 17.7814H16.9C16.5817 17.7814 16.2765 17.9078 16.0515 18.1329C15.8264 18.3579 15.7 18.6631 15.7 18.9814C15.7 19.2997 15.8264 19.6049 16.0515 19.8299C16.2765 20.055 16.5817 20.1814 16.9 20.1814ZM31.3 29.7814H30.1V9.3814C30.1 9.06314 29.9736 8.75791 29.7485 8.53287C29.5235 8.30782 29.2183 8.1814 28.9 8.1814H12.1C11.7817 8.1814 11.4765 8.30782 11.2515 8.53287C11.0264 8.75791 10.9 9.06314 10.9 9.3814V29.7814H9.7C9.38174 29.7814 9.07652 29.9078 8.85147 30.1329C8.62643 30.3579 8.5 30.6631 8.5 30.9814C8.5 31.2997 8.62643 31.6049 8.85147 31.8299C9.07652 32.055 9.38174 32.1814 9.7 32.1814H31.3C31.6183 32.1814 31.9235 32.055 32.1485 31.8299C32.3736 31.6049 32.5 31.2997 32.5 30.9814C32.5 30.6631 32.3736 30.3579 32.1485 30.1329C31.9235 29.9078 31.6183 29.7814 31.3 29.7814ZM21.7 29.7814H19.3V24.9814H21.7V29.7814ZM27.7 29.7814H24.1V23.7814C24.1 23.4631 23.9736 23.1579 23.7485 22.9329C23.5235 22.7078 23.2183 22.5814 22.9 22.5814H18.1C17.7817 22.5814 17.4765 22.7078 17.2515 22.9329C17.0264 23.1579 16.9 23.4631 16.9 23.7814V29.7814H13.3V10.5814H27.7V29.7814Z"
                fill="black"
              />
            </svg>

            {isMenuExpanded && (
              <span
                className={twMerge(
                  "trnasition-[opacity] inline-block text-black duration-300",
                  isMenuExpanded ? "opacity-100" : "opacity-0",
                )}
              >
                Companies
              </span>
            )}
          </Link>
        </Tabs.Item>

        <Tabs.Item
          href="/retailers"
          accessableBy={["super-admin", "company"]}
        >
          <Link
            href="/retailers"
            className="flex items-center space-x-4"
            title="retailers"
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
                d="M32.4916 15.1675C32.4974 15.0916 32.4974 15.0154 32.4916 14.9395L30.0924 8.94025C29.9987 8.7031 29.8319 8.50199 29.6162 8.36606C29.4005 8.23014 29.1471 8.16649 28.8928 8.18434H12.0987C11.8585 8.18411 11.6237 8.25604 11.4248 8.39081C11.2259 8.52559 11.072 8.717 10.9831 8.94025L8.58397 14.9395C8.57819 15.0154 8.57819 15.0916 8.58397 15.1675C8.54411 15.2343 8.51573 15.3073 8.5 15.3835C8.51335 16.2128 8.74139 17.0246 9.16186 17.7396C9.58234 18.4546 10.1809 19.0483 10.8992 19.463V30.9815C10.8992 31.2998 11.0255 31.605 11.2505 31.83C11.4755 32.055 11.7806 32.1814 12.0987 32.1814H28.8928C29.211 32.1814 29.5161 32.055 29.7411 31.83C29.966 31.605 30.0924 31.2998 30.0924 30.9815V19.511C30.8176 19.0922 31.4206 18.4909 31.8415 17.7668C32.2624 17.0427 32.4865 16.221 32.4916 15.3835C32.5028 15.3119 32.5028 15.239 32.4916 15.1675ZM21.6954 29.7817H19.2962V24.9823H21.6954V29.7817ZM27.6933 29.7817H24.0945V23.7824C24.0945 23.4642 23.9681 23.159 23.7432 22.934C23.5182 22.709 23.2131 22.5826 22.8949 22.5826H18.0966C17.7785 22.5826 17.4734 22.709 17.2484 22.934C17.0234 23.159 16.8971 23.4642 16.8971 23.7824V29.7817H13.2983V20.1829C13.9814 20.179 14.6559 20.0293 15.2765 19.7438C15.8971 19.4582 16.4496 19.0434 16.8971 18.5271C17.3473 19.0378 17.9011 19.4468 18.5216 19.7269C19.1421 20.0071 19.815 20.152 20.4958 20.152C21.1766 20.152 21.8495 20.0071 22.47 19.7269C23.0905 19.4468 23.6442 19.0378 24.0945 18.5271C24.542 19.0434 25.0945 19.4582 25.7151 19.7438C26.3357 20.0293 27.0101 20.179 27.6933 20.1829V29.7817ZM27.6933 17.7832C27.057 17.7832 26.4467 17.5303 25.9968 17.0803C25.5469 16.6303 25.2941 16.0199 25.2941 15.3835C25.2941 15.0652 25.1677 14.76 24.9428 14.535C24.7178 14.31 24.4127 14.1836 24.0945 14.1836C23.7764 14.1836 23.4713 14.31 23.2463 14.535C23.0213 14.76 22.8949 15.0652 22.8949 15.3835C22.8949 16.0199 22.6422 16.6303 22.1922 17.0803C21.7423 17.5303 21.1321 17.7832 20.4958 17.7832C19.8595 17.7832 19.2493 17.5303 18.7993 17.0803C18.3494 16.6303 18.0966 16.0199 18.0966 15.3835C18.0966 15.0652 17.9702 14.76 17.7453 14.535C17.5203 14.31 17.2152 14.1836 16.8971 14.1836C16.5789 14.1836 16.2738 14.31 16.0488 14.535C15.8239 14.76 15.6975 15.0652 15.6975 15.3835C15.7093 15.6986 15.6589 16.013 15.5493 16.3086C15.4396 16.6043 15.2728 16.8755 15.0584 17.1067C14.844 17.3379 14.5861 17.5245 14.2996 17.656C14.013 17.7876 13.7033 17.8613 13.3883 17.8732C12.752 17.897 12.1323 17.6671 11.6655 17.2339C11.4343 17.0194 11.2477 16.7615 11.1162 16.4749C10.9847 16.1883 10.911 15.8786 10.8992 15.5634L12.9144 10.584H28.0771L30.0924 15.5634C30.0469 16.1682 29.7742 16.7333 29.3291 17.1451C28.884 17.5569 28.2996 17.7849 27.6933 17.7832Z"
                fill="black"
              />
            </svg>

            {isMenuExpanded && <span className="inline-block text-black">Retailers</span>}
          </Link>
        </Tabs.Item>

        <Tabs.Item
          href="/products"
          accessableBy={["super-admin", "company", "retailer"]}
        >
          <Link
            href="/products"
            className="flex items-center space-x-4"
            title="products"
          >
            <svg
              width="41"
              height="41"
              viewBox="0 0 41 41"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="inline-block w-10"
            >
              <path
                d="M31.2809 13.5722H10.5943C10.3147 13.5722 10.035 13.5696 9.75543 13.5722H9.71896C10.0059 14.3116 10.2928 15.0485 10.5797 15.7879L12.1844 13.9665C13.0379 12.9988 13.8913 12.0336 14.7423 11.0658C14.9368 10.8453 15.1338 10.6222 15.3283 10.4016C15.0414 10.5288 14.7545 10.6559 14.4675 10.7804H25.054C25.5403 10.7804 26.0266 10.7882 26.5129 10.7804H26.5347C26.2478 10.6533 25.9609 10.5262 25.674 10.4016L27.2788 12.223C28.1322 13.1908 28.9856 14.1559 29.8366 15.1237C30.0312 15.3442 30.2281 15.5674 30.4226 15.7879C30.6317 16.0266 30.9794 16.1667 31.2833 16.1667C31.5824 16.1667 31.9374 16.0266 32.1441 15.7879C32.3556 15.5414 32.5136 15.2171 32.4991 14.8694C32.4845 14.5192 32.3702 14.2104 32.1441 13.951C31.6602 13.4035 31.1788 12.8561 30.6949 12.3086C29.8707 11.3746 29.0489 10.4406 28.2246 9.50912C27.979 9.22891 27.731 8.95129 27.4854 8.67108C27.235 8.38568 26.9238 8.19368 26.5323 8.1859H14.8371C14.6183 8.1859 14.3533 8.15996 14.1442 8.2326C13.726 8.3779 13.495 8.69443 13.2105 9.01615C12.4446 9.88273 11.6811 10.7493 10.9152 11.6185C10.2636 12.3579 9.61197 13.0948 8.96035 13.8342C8.92631 13.8731 8.88984 13.9147 8.8558 13.9536C8.51783 14.3376 8.41085 14.8824 8.60536 15.3702C8.79258 15.8398 9.22781 16.1667 9.71652 16.1667H30.4032C30.6828 16.1667 30.9624 16.1693 31.242 16.1667H31.2785C31.5897 16.1667 31.9179 16.0214 32.1392 15.7879C32.3507 15.5622 32.5088 15.1938 32.4942 14.8694C32.4796 14.5347 32.3775 14.1871 32.1392 13.951C31.9034 13.7201 31.6116 13.5722 31.2809 13.5722Z"
                fill="black"
              />
              <path
                d="M30.0652 14.8668V28.9163C30.0652 29.5623 30.0579 30.211 30.0652 30.857V30.883L31.2809 29.5857H10.5943C10.3147 29.5857 10.035 29.5831 9.75543 29.5857H9.71896L10.9347 30.883V16.8335C10.9347 16.1875 10.942 15.5388 10.9347 14.8928V14.8668L9.71896 16.1641H30.4056C30.6852 16.1641 30.9648 16.1667 31.2444 16.1641H31.2809C31.5921 16.1641 31.9204 16.0188 32.1416 15.7853C32.3532 15.5596 32.5112 15.1912 32.4966 14.8668C32.482 14.5321 32.3799 14.1845 32.1416 13.9484C31.9034 13.7149 31.6116 13.5696 31.2809 13.5696H10.5943C10.3147 13.5696 10.035 13.567 9.75543 13.5696H9.71896C9.06247 13.5696 8.50324 14.1637 8.50324 14.8668V28.9163C8.50324 29.5623 8.49595 30.211 8.50324 30.857V30.883C8.50324 31.5835 9.06004 32.1802 9.71896 32.1802H30.4056C30.6852 32.1802 30.9648 32.1828 31.2444 32.1802H31.2809C31.9374 32.1802 32.4966 31.5861 32.4966 30.883V16.8335C32.4966 16.1875 32.5039 15.5388 32.4966 14.8928V14.8668C32.4966 14.5347 32.3605 14.1845 32.1416 13.9484C31.9301 13.7227 31.5848 13.554 31.2809 13.5696C30.9673 13.5851 30.6414 13.6941 30.4202 13.9484C30.2038 14.2052 30.0652 14.5166 30.0652 14.8668Z"
                fill="black"
              />
              <path
                d="M21.9661 14.8668V21.9811C22.5764 21.6075 23.1867 21.2339 23.7945 20.8602C22.9921 20.4114 22.1898 19.9625 21.385 19.5137C21.2829 19.4566 21.1807 19.3969 21.0762 19.3398C20.8865 19.2386 20.6799 19.1504 20.461 19.1608C20.2373 19.1712 20.0477 19.2283 19.8459 19.3372C19.8361 19.3424 19.8264 19.3476 19.8167 19.3554C19.7632 19.3865 19.7073 19.4151 19.6538 19.4462C19.187 19.7083 18.7201 19.9677 18.2533 20.2298C17.8788 20.4399 17.5044 20.6501 17.1275 20.8576C17.7378 21.2313 18.3481 21.6049 18.956 21.9785V14.8642L17.7403 16.1615H23.1794C23.4906 16.1615 23.8188 16.0162 24.0401 15.7827C24.2516 15.557 24.4097 15.1886 24.3951 14.8642C24.3805 14.5296 24.2784 14.1819 24.0401 13.9458C23.8018 13.7123 23.51 13.567 23.1794 13.567H17.7403C17.0838 13.567 16.5245 14.1611 16.5245 14.8642V21.9785C16.5245 22.4351 16.758 22.8684 17.1275 23.0993C17.5166 23.3432 17.9639 23.3173 18.3554 23.0993C19.1481 22.6557 19.9431 22.212 20.7358 21.7683C20.8501 21.7061 20.9619 21.6412 21.0762 21.5789H19.8483C20.641 22.0226 21.436 22.4663 22.2287 22.9099C22.343 22.9722 22.4548 23.0371 22.5691 23.0993C22.9581 23.3173 23.4079 23.3432 23.797 23.0993C24.1665 22.8684 24.3999 22.4377 24.3999 21.9785V14.8642C24.3999 14.5321 24.2638 14.1819 24.045 13.9458C23.8334 13.7201 23.4882 13.5514 23.1842 13.567C22.8706 13.5825 22.5448 13.6915 22.3235 13.9458C22.1047 14.2052 21.9661 14.5166 21.9661 14.8668Z"
                fill="black"
              />
            </svg>

            {isMenuExpanded && <span className="inline-block text-black">Products</span>}
          </Link>
        </Tabs.Item>
        <Tabs.Item
          href="/batch"
          accessableBy={["super-admin", "company"]}
        >
          <Link
            href="/batch"
            className="flex items-center space-x-4"
            title="batch"
          >
            <svg
              width="41"
              height="41"
              viewBox="0 0 41 41"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="inline-block w-10"
            >
              <path
                d="M8.9231 25.5385L20 32L31.0769 25.5385"
                stroke="black"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M8.9231 20L20 26.4615L31.0769 20"
                stroke="black"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M8.9231 14.4615L20 20.9231L31.0769 14.4615L20 8L8.9231 14.4615Z"
                stroke="black"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>

            {isMenuExpanded && <span className="inline-block text-black">Batch</span>}
          </Link>
        </Tabs.Item>

        <Tabs.Item
          href="/company-sales"
          accessableBy={["super-admin", "company"]}
        >
          <Link
            href="/company-sales"
            className="flex items-center space-x-4"
            title="company-sales"
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clip-path="url(#clip0_1381_1310)">
                <path
                  d="M32.4351 16.335C32.4151 16.035 32.2951 15.755 32.0951 15.545L24.8951 8.345C24.7951 8.245 24.6751 8.175 24.5451 8.115C24.5151 8.095 24.4751 8.085 24.4351 8.075C24.3351 8.035 24.2251 8.015 24.1151 8.005C24.0951 8.005 24.0751 7.995 24.0451 7.995H16.8451C15.8951 7.995 14.9751 8.375 14.3051 9.055C13.6251 9.725 13.2451 10.645 13.2451 11.595V16.735H10.5151C10.2251 16.735 9.96505 16.845 9.75505 17.055C9.55505 17.255 9.44505 17.525 9.44505 17.805V29.595H8.11505C7.80505 29.595 7.55505 29.845 7.55505 30.155V31.445C7.55505 31.755 7.80505 32.005 8.11505 32.005H28.8451C29.7951 32.005 30.7151 31.625 31.3851 30.945C32.0651 30.275 32.4451 29.355 32.4451 28.405V16.405C32.4451 16.405 32.4351 16.355 32.4351 16.335ZM25.2451 12.095L28.3451 15.195H26.4451C26.1251 15.195 25.8251 15.065 25.5951 14.845C25.3751 14.615 25.2451 14.315 25.2451 13.995V12.095ZM16.0051 29.595H15.2351V27.625H16.0051V29.595ZM19.6451 29.595H18.1451V26.555C18.1451 26.265 18.0251 25.995 17.8351 25.795C17.6251 25.585 17.3551 25.475 17.0751 25.475H14.1551C13.8751 25.475 13.6051 25.585 13.4051 25.795C13.2051 25.995 13.0851 26.265 13.0851 26.555V29.595H11.5851V18.885H19.6451V29.595ZM30.0451 28.395C30.0451 28.715 29.9151 29.015 29.6951 29.245C29.4651 29.465 29.1651 29.595 28.8451 29.595H21.7851V17.805C21.7851 17.525 21.6751 17.255 21.4751 17.055C21.2651 16.845 21.0051 16.735 20.7151 16.735H15.6451V11.595C15.6451 11.275 15.7751 10.975 15.9951 10.745C16.2251 10.525 16.5251 10.395 16.8451 10.395H22.5151C22.6951 10.395 22.8451 10.545 22.8451 10.725V13.995C22.8451 14.745 23.0851 15.475 23.5251 16.075H23.5351C23.5351 16.075 23.5451 16.105 23.5551 16.115C23.5851 16.165 23.6151 16.205 23.6451 16.235C23.6651 16.265 23.6851 16.295 23.7051 16.315C23.7651 16.395 23.8351 16.465 23.9051 16.535C23.9751 16.615 24.0551 16.685 24.1351 16.745C24.7751 17.295 25.6051 17.595 26.4451 17.595H29.7151C29.8951 17.595 30.0451 17.745 30.0451 17.925V28.395Z"
                  fill="black"
                />
                <path
                  d="M13.4351 24.705H14.1551C14.4451 24.705 14.7151 24.595 14.9151 24.395C15.1151 24.195 15.2351 23.915 15.2351 23.635C15.2351 23.355 15.1151 23.075 14.9151 22.875C14.7151 22.675 14.4451 22.565 14.1551 22.565H13.4351C13.1451 22.565 12.8751 22.675 12.6751 22.875C12.4751 23.085 12.3551 23.345 12.3551 23.635C12.3551 23.925 12.4751 24.195 12.6751 24.395C12.8751 24.595 13.1451 24.705 13.4351 24.705Z"
                  fill="black"
                />
                <path
                  d="M13.4351 21.795H14.1551C14.4451 21.795 14.7151 21.685 14.9151 21.485C15.1151 21.285 15.2351 21.005 15.2351 20.725C15.2351 20.445 15.1151 20.165 14.9151 19.965C14.7151 19.765 14.4451 19.655 14.1551 19.655H13.4351C13.1451 19.655 12.8751 19.765 12.6751 19.965C12.4751 20.165 12.3551 20.435 12.3551 20.725C12.3551 21.015 12.4751 21.275 12.6751 21.485C12.8751 21.685 13.1451 21.795 13.4351 21.795Z"
                  fill="black"
                />
                <path
                  d="M17.075 24.705H17.805C18.085 24.705 18.355 24.595 18.555 24.395C18.755 24.195 18.875 23.915 18.875 23.635C18.875 23.355 18.755 23.075 18.555 22.875C18.355 22.675 18.085 22.565 17.805 22.565H17.075C16.795 22.565 16.515 22.675 16.315 22.875C16.115 23.075 16.005 23.355 16.005 23.635C16.005 23.915 16.115 24.195 16.315 24.395C16.515 24.595 16.795 24.705 17.075 24.705Z"
                  fill="black"
                />
                <path
                  d="M17.075 21.795H17.805C18.085 21.795 18.355 21.675 18.555 21.475C18.755 21.275 18.875 21.005 18.875 20.725C18.875 20.445 18.755 20.165 18.555 19.965C18.355 19.765 18.085 19.655 17.805 19.655H17.075C16.795 19.655 16.515 19.765 16.315 19.965C16.115 20.165 16.005 20.445 16.005 20.725C16.005 21.005 16.115 21.285 16.315 21.485C16.515 21.685 16.785 21.795 17.075 21.795Z"
                  fill="black"
                />
              </g>
              <defs>
                <clipPath id="clip0_1381_1310">
                  <rect
                    width="24.89"
                    height="24.01"
                    fill="white"
                    transform="translate(7.55505 7.995)"
                  />
                </clipPath>
              </defs>
            </svg>

            {isMenuExpanded && <span className="inline-block text-black">Company Sales</span>}
          </Link>
        </Tabs.Item>

        <Tabs.Item
          href="/retailer-sales"
          accessableBy={["super-admin", "retailer"]}
        >
          <Link
            href="/retailer-sales"
            className="flex items-center space-x-4"
            title="retailer-sales"
          >
            <svg
              width="41"
              height="40"
              viewBox="0 0 41 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M32.44 16.335C32.42 16.035 32.3 15.755 32.1 15.545L24.91 8.345C24.81 8.245 24.69 8.175 24.56 8.115C24.53 8.095 24.49 8.085 24.45 8.075C24.35 8.035 24.24 8.015 24.13 8.005C24.11 8.005 24.09 8.005 24.06 8.005H16.86C15.91 8.005 14.99 8.385 14.32 9.065C13.64 9.735 13.26 10.655 13.26 11.605V16.085H12.12C11.89 16.085 11.68 16.155 11.49 16.285C11.3 16.415 11.16 16.595 11.07 16.805L9.55998 20.585L9.52998 20.695C9.52998 20.695 9.52998 20.755 9.52998 20.795C9.50998 20.845 9.48998 20.915 9.47998 21.015C9.47998 21.605 9.64998 22.185 9.94998 22.685C10.21 23.125 10.57 23.505 11 23.795V30.865C11 31.165 11.12 31.455 11.33 31.665C11.54 31.875 11.83 31.995 12.13 31.995H28.86C29.81 31.995 30.73 31.615 31.4 30.935C32.08 30.265 32.46 29.345 32.46 28.395V16.405C32.46 16.405 32.45 16.355 32.45 16.335H32.44ZM25.26 12.095L28.36 15.195H26.46C26.14 15.195 25.84 15.065 25.61 14.845C25.39 14.615 25.26 14.315 25.26 13.995V12.095ZM12.11 21.895C12 21.795 11.91 21.675 11.85 21.535C11.8 21.425 11.77 21.305 11.75 21.175L12.9 18.345H21.98L23.12 21.175C23.08 21.435 22.96 21.665 22.77 21.845C22.56 22.045 22.27 22.175 21.99 22.145C21.69 22.145 21.4 22.025 21.18 21.805C20.97 21.595 20.85 21.295 20.85 20.995C20.85 20.695 20.73 20.405 20.52 20.195C20.09 19.765 19.35 19.765 18.92 20.195C18.71 20.405 18.59 20.695 18.59 20.995C18.59 21.295 18.47 21.585 18.26 21.805C17.83 22.235 17.07 22.235 16.65 21.805C16.44 21.595 16.32 21.295 16.32 20.995C16.32 20.695 16.2 20.405 15.99 20.195C15.56 19.765 14.82 19.765 14.39 20.195C14.18 20.405 14.06 20.695 14.06 21.015C14.06 21.165 14.04 21.315 13.99 21.455C13.94 21.595 13.86 21.725 13.76 21.835C13.66 21.945 13.53 22.035 13.4 22.095C13.26 22.155 13.12 22.195 12.97 22.195C12.68 22.195 12.37 22.095 12.15 21.885L12.11 21.895ZM17.82 29.725H17.05V27.445H17.82V29.725ZM21.61 29.725H20.08V26.305C20.08 26.005 19.96 25.715 19.75 25.505C19.54 25.295 19.25 25.175 18.95 25.175H15.92C15.62 25.175 15.33 25.295 15.12 25.505C14.91 25.715 14.79 26.005 14.79 26.305V29.725H13.26V24.385C13.62 24.345 13.96 24.245 14.29 24.095C14.61 23.945 14.9 23.755 15.16 23.515C15.42 23.745 15.71 23.935 16.03 24.085C16.91 24.485 17.95 24.485 18.83 24.085C19.15 23.945 19.44 23.755 19.7 23.515C19.96 23.755 20.25 23.945 20.57 24.095C20.9 24.245 21.24 24.345 21.6 24.385V29.725H21.61ZM30.06 28.385C30.06 28.705 29.93 29.005 29.71 29.235C29.48 29.455 29.18 29.585 28.86 29.585H23.88V23.815C24.31 23.525 24.67 23.145 24.93 22.695C25.23 22.185 25.39 21.595 25.39 21.055C25.4 20.985 25.4 20.915 25.39 20.855C25.39 20.805 25.39 20.745 25.39 20.695L23.85 16.795C23.76 16.565 23.61 16.385 23.4 16.255C23.2 16.125 22.96 16.075 22.74 16.085H15.66V11.595C15.66 11.275 15.79 10.975 16.01 10.745C16.24 10.525 16.54 10.395 16.86 10.395H22.53C22.71 10.395 22.86 10.545 22.86 10.725V13.995C22.86 14.745 23.1 15.475 23.54 16.075C23.83 16.475 23.84 16.475 23.54 16.085C23.64 16.245 23.77 16.395 23.91 16.535C23.98 16.615 24.06 16.685 24.14 16.745C24.78 17.295 25.61 17.595 26.45 17.595H29.72C29.9 17.595 30.05 17.745 30.05 17.925V28.395L30.06 28.385Z"
                fill="black"
              />
            </svg>

            {isMenuExpanded && <span className="inline-block text-black hover:text-white">Retailer Sales</span>}
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
