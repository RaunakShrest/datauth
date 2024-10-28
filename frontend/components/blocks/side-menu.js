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
    <div className="flex h-[98%] flex-col justify-between">
      <Tabs>
        <Tabs.Item accessableBy={["super-admin", "company", "retailer"]}>
          <Link
            href="/"
            className="inline-block space-x-4 transition-all duration-300 group-hover:scale-110"
            title="dashboard"
          >
            <svg
              width="30"
              height="30"
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="inline-block w-10"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.15395 0.00014057L4.03781 7.13834e-05C3.51062 -0.000431689 3.05617 -0.000865521 2.65357 0.0957937C1.38788 0.399645 0.399645 1.38788 0.0957937 2.65357C-0.000865521 3.05617 -0.000431689 3.51062 7.13834e-05 4.03781L0.00014057 4.15395V9.69237L7.13834e-05 9.80851C-0.000431689 10.3357 -0.000865521 10.7902 0.0957937 11.1927C0.399645 12.4584 1.38788 13.4467 2.65357 13.7506C3.05617 13.8472 3.51062 13.8468 4.03781 13.8462L4.15395 13.8462H9.69237L9.80851 13.8462C10.3357 13.8468 10.7902 13.8472 11.1927 13.7506C12.4584 13.4467 13.4467 12.4584 13.7506 11.1927C13.8472 10.7902 13.8468 10.3357 13.8462 9.80851L13.8462 9.69237V4.15395L13.8462 4.03781C13.8468 3.51062 13.8472 3.05617 13.7506 2.65357C13.4467 1.38788 12.4584 0.399645 11.1927 0.0957937C10.7902 -0.000865521 10.3357 -0.000431689 9.80851 7.13834e-05L9.69237 0.00014057H4.15395ZM3.1923 2.33971C3.29162 2.31584 3.4437 2.30781 4.15395 2.30781H9.69237C10.4026 2.30781 10.5547 2.31584 10.654 2.33971C11.0759 2.44099 11.4053 2.77039 11.5066 3.1923C11.5305 3.29162 11.5385 3.4437 11.5385 4.15395V9.69237C11.5385 10.4026 11.5305 10.5547 11.5066 10.654C11.4053 11.0759 11.0759 11.4053 10.654 11.5066C10.5547 11.5305 10.4026 11.5385 9.69237 11.5385H4.15395C3.4437 11.5385 3.29162 11.5305 3.1923 11.5066C2.77039 11.4053 2.44099 11.0759 2.33971 10.654C2.31584 10.5547 2.30781 10.4026 2.30781 9.69237V4.15395C2.30781 3.4437 2.31584 3.29162 2.33971 3.1923C2.44099 2.77039 2.77039 2.44099 3.1923 2.33971ZM20.3077 0.00014057L20.1915 7.13834e-05C19.6643 -0.000431689 19.2099 -0.000865521 18.8073 0.0957937C17.5416 0.399645 16.5534 1.38788 16.2495 2.65357C16.1528 3.05617 16.1533 3.51062 16.1538 4.03781L16.1539 4.15395V9.69237L16.1538 9.80851C16.1533 10.3357 16.1528 10.7902 16.2495 11.1927C16.5534 12.4584 17.5416 13.4467 18.8073 13.7506C19.2099 13.8472 19.6643 13.8468 20.1915 13.8462L20.3077 13.8462H25.8461L25.9622 13.8462C26.4895 13.8468 26.9438 13.8472 27.3465 13.7506C28.6121 13.4467 29.6004 12.4584 29.9044 11.1927C30.0008 10.7902 30.0006 10.3357 29.9999 9.80851V9.69237V4.15395V4.03781C30.0006 3.51062 30.0008 3.05617 29.9044 2.65357C29.6004 1.38788 28.6121 0.399645 27.3465 0.0957937C26.9438 -0.000865521 26.4895 -0.000431689 25.9622 7.13834e-05L25.8461 0.00014057H20.3077ZM19.346 2.33971C19.4453 2.31584 19.5974 2.30781 20.3077 2.30781H25.8461C26.5564 2.30781 26.7085 2.31584 26.8077 2.33971C27.2295 2.44099 27.5591 2.77039 27.6604 3.1923C27.6841 3.29162 27.6922 3.4437 27.6922 4.15395V9.69237C27.6922 10.4026 27.6841 10.5547 27.6604 10.654C27.5591 11.0759 27.2295 11.4053 26.8077 11.5066C26.7085 11.5305 26.5564 11.5385 25.8461 11.5385H20.3077C19.5974 11.5385 19.4453 11.5305 19.346 11.5066C18.9241 11.4053 18.5947 11.0759 18.4934 10.654C18.4696 10.5547 18.4615 10.4026 18.4615 9.69237V4.15395C18.4615 3.4437 18.4696 3.29162 18.4934 3.1923C18.5947 2.77039 18.9241 2.44099 19.346 2.33971ZM4.03781 16.1538L4.15395 16.1539H9.69237L9.80851 16.1538C10.3357 16.1533 10.7902 16.1528 11.1927 16.2495C12.4584 16.5534 13.4467 17.5416 13.7506 18.8073C13.8472 19.2099 13.8468 19.6643 13.8462 20.1915L13.8462 20.3077V25.8461L13.8462 25.9622C13.8468 26.4895 13.8472 26.9438 13.7506 27.3465C13.4467 28.6121 12.4584 29.6004 11.1927 29.9044C10.7902 30.0008 10.3357 30.0006 9.80851 29.9999H9.69237H4.15395H4.03781C3.51062 30.0006 3.05617 30.0008 2.65357 29.9044C1.38788 29.6004 0.399645 28.6121 0.0957937 27.3465C-0.000865521 26.9438 -0.000431689 26.4895 7.13834e-05 25.9622L0.00014057 25.8461V20.3077L7.13834e-05 20.1915C-0.000431689 19.6643 -0.000865521 19.2099 0.0957937 18.8073C0.399645 17.5416 1.38788 16.5534 2.65357 16.2495C3.05617 16.1528 3.51062 16.1533 4.03781 16.1538ZM4.15395 18.4615C3.4437 18.4615 3.29162 18.4696 3.1923 18.4934C2.77039 18.5947 2.44099 18.9241 2.33971 19.346C2.31584 19.4453 2.30781 19.5974 2.30781 20.3077V25.8461C2.30781 26.5564 2.31584 26.7085 2.33971 26.8077C2.44099 27.2295 2.77039 27.5591 3.1923 27.6604C3.29162 27.6841 3.4437 27.6922 4.15395 27.6922H9.69237C10.4026 27.6922 10.5547 27.6841 10.654 27.6604C11.0759 27.5591 11.4053 27.2295 11.5066 26.8077C11.5305 26.7085 11.5385 26.5564 11.5385 25.8461V20.3077C11.5385 19.5974 11.5305 19.4453 11.5066 19.346C11.4053 18.9241 11.0759 18.5947 10.654 18.4934C10.5547 18.4696 10.4026 18.4615 9.69237 18.4615H4.15395ZM20.3077 16.1539L20.1915 16.1538C19.6643 16.1533 19.2099 16.1528 18.8073 16.2495C17.5416 16.5534 16.5534 17.5416 16.2495 18.8073C16.1528 19.2099 16.1533 19.6643 16.1538 20.1915L16.1539 20.3077V25.8461L16.1538 25.9622C16.1533 26.4895 16.1528 26.9438 16.2495 27.3465C16.5534 28.6121 17.5416 29.6004 18.8073 29.9044C19.2099 30.0008 19.6643 30.0006 20.1915 29.9999H20.3077H25.8461H25.9622C26.4895 30.0006 26.9438 30.0008 27.3465 29.9044C28.6121 29.6004 29.6004 28.6121 29.9044 27.3465C30.0008 26.9438 30.0006 26.4895 29.9999 25.9622V25.8461V20.3077V20.1915C30.0006 19.6643 30.0008 19.2099 29.9044 18.8073C29.6004 17.5416 28.6121 16.5534 27.3465 16.2495C26.9438 16.1528 26.4895 16.1533 25.9622 16.1538L25.8461 16.1539H20.3077ZM19.346 18.4934C19.4453 18.4696 19.5974 18.4615 20.3077 18.4615H25.8461C26.5564 18.4615 26.7085 18.4696 26.8077 18.4934C27.2295 18.5947 27.5591 18.9241 27.6604 19.346C27.6841 19.4453 27.6922 19.5974 27.6922 20.3077V25.8461C27.6922 26.5564 27.6841 26.7085 27.6604 26.8077C27.5591 27.2295 27.2295 27.5591 26.8077 27.6604C26.7085 27.6841 26.5564 27.6922 25.8461 27.6922H20.3077C19.5974 27.6922 19.4453 27.6841 19.346 27.6604C18.9241 27.5591 18.5947 27.2295 18.4934 26.8077C18.4696 26.7085 18.4615 26.5564 18.4615 25.8461V20.3077C18.4615 19.5974 18.4696 19.4453 18.4934 19.346C18.5947 18.9241 18.9241 18.5947 19.346 18.4934Z"
                fill="white"
              />
            </svg>

            {isMenuExpanded && <span className="inline-block">Dashboard</span>}
          </Link>
        </Tabs.Item>

        <Tabs.Item accessableBy={["super-admin", "company", "retailer"]}>
          <Link
            href="/product-types"
            className="inline-block space-x-4 transition-all duration-300 group-hover:scale-110"
            title="product types"
          >
            <svg
              width="25"
              height="25"
              viewBox="0 0 25 25"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="inline-block w-10"
            >
              <path
                d="M3.75 22.5C4.44036 22.5 5 21.9404 5 21.25C5 20.5596 4.44036 20 3.75 20C3.05964 20 2.5 20.5596 2.5 21.25C2.5 21.9404 3.05964 22.5 3.75 22.5Z"
                fill="white"
              />
              <path
                d="M2.5 2.5H5V13.75H2.5V2.5Z"
                fill="white"
              />
              <path
                d="M6.25 0H1.25C0.918479 0 0.600537 0.131696 0.366116 0.366116C0.131696 0.600537 0 0.918479 0 1.25V23.75C0 24.0815 0.131696 24.3995 0.366116 24.6339C0.600537 24.8683 0.918479 25 1.25 25H6.25C6.58152 25 6.89946 24.8683 7.13388 24.6339C7.3683 24.3995 7.5 24.0815 7.5 23.75V1.25C7.5 0.918479 7.3683 0.600537 7.13388 0.366116C6.89946 0.131696 6.58152 0 6.25 0ZM6.25 23.75H1.25V1.25H6.25V23.75Z"
                fill="white"
              />
              <path
                d="M12.5 22.5C13.1904 22.5 13.75 21.9404 13.75 21.25C13.75 20.5596 13.1904 20 12.5 20C11.8096 20 11.25 20.5596 11.25 21.25C11.25 21.9404 11.8096 22.5 12.5 22.5Z"
                fill="white"
              />
              <path
                d="M11.25 2.5H13.75V13.75H11.25V2.5Z"
                fill="white"
              />
              <path
                d="M15 0H10C9.66848 0 9.35054 0.131696 9.11612 0.366116C8.8817 0.600537 8.75 0.918479 8.75 1.25V23.75C8.75 24.0815 8.8817 24.3995 9.11612 24.6339C9.35054 24.8683 9.66848 25 10 25H15C15.3315 25 15.6495 24.8683 15.8839 24.6339C16.1183 24.3995 16.25 24.0815 16.25 23.75V1.25C16.25 0.918479 16.1183 0.600537 15.8839 0.366116C15.6495 0.131696 15.3315 0 15 0ZM15 23.75H10V1.25H15V23.75Z"
                fill="white"
              />
              <path
                d="M21.25 22.5C21.9404 22.5 22.5 21.9404 22.5 21.25C22.5 20.5596 21.9404 20 21.25 20C20.5596 20 20 20.5596 20 21.25C20 21.9404 20.5596 22.5 21.25 22.5Z"
                fill="white"
              />
              <path
                d="M20 2.5H22.5V13.75H20V2.5Z"
                fill="white"
              />
              <path
                d="M23.75 0H18.75C18.4185 0 18.1005 0.131696 17.8661 0.366116C17.6317 0.600537 17.5 0.918479 17.5 1.25V23.75C17.5 24.0815 17.6317 24.3995 17.8661 24.6339C18.1005 24.8683 18.4185 25 18.75 25H23.75C24.0815 25 24.3995 24.8683 24.6339 24.6339C24.8683 24.3995 25 24.0815 25 23.75V1.25C25 0.918479 24.8683 0.600537 24.6339 0.366116C24.3995 0.131696 24.0815 0 23.75 0ZM23.75 23.75H18.75V1.25H23.75V23.75Z"
                fill="white"
              />
            </svg>

            {isMenuExpanded && <span className="inline-block">Product Types</span>}
          </Link>
        </Tabs.Item>

        <Tabs.Item accessableBy={["super-admin", "retailer"]}>
          <Link
            href="/companies"
            className="inline-block space-x-4 transition-all duration-300 group-hover:scale-110"
            title="companies"
          >
            <svg
              className="inline-block w-10"
              width="30"
              height="30"
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M13.5 0C15.9853 0 18 2.01472 18 4.5L18.0001 6.25601C18.4693 6.09021 18.9741 6 19.5 6H25.5C27.9853 6 30 8.01472 30 10.5V25.5C30 27.9853 27.9853 30 25.5 30H4.5C2.01472 30 0 27.9853 0 25.5V4.5C0 2.01472 2.01472 0 4.5 0H13.5ZM13.5 3H4.5C3.67157 3 3 3.67157 3 4.5V25.5C3 26.3284 3.67157 27 4.5 27H15V4.5C15 3.67157 14.3284 3 13.5 3ZM25.5 9H19.5C18.6716 9 18 9.67157 18 10.5V27H25.5C26.3284 27 27 26.3284 27 25.5V10.5C27 9.67157 26.3284 9 25.5 9ZM10.5 18C11.3284 18 12 18.6716 12 19.5C12 20.3284 11.3284 21 10.5 21H7.5C6.67157 21 6 20.3284 6 19.5C6 18.6716 6.67157 18 7.5 18H10.5ZM24 18C24.8284 18 25.5 18.6716 25.5 19.5C25.5 20.3284 24.8284 21 24 21H21C20.1716 21 19.5 20.3284 19.5 19.5C19.5 18.6716 20.1716 18 21 18H24ZM10.5 12C11.3284 12 12 12.6716 12 13.5C12 14.3284 11.3284 15 10.5 15H7.5C6.67157 15 6 14.3284 6 13.5C6 12.6716 6.67157 12 7.5 12H10.5ZM24 12C24.8284 12 25.5 12.6716 25.5 13.5C25.5 14.3284 24.8284 15 24 15H21C20.1716 15 19.5 14.3284 19.5 13.5C19.5 12.6716 20.1716 12 21 12H24ZM10.5 6C11.3284 6 12 6.67157 12 7.5C12 8.32843 11.3284 9 10.5 9H7.5C6.67157 9 6 8.32843 6 7.5C6 6.67157 6.67157 6 7.5 6H10.5Z"
                fill="white"
              />
            </svg>

            {isMenuExpanded && (
              <span
                className={twMerge(
                  "trnasition-[opacity] inline-block duration-300",
                  isMenuExpanded ? "opacity-100" : "opacity-0",
                )}
              >
                Companies
              </span>
            )}
          </Link>
        </Tabs.Item>

        <Tabs.Item accessableBy={["super-admin", "company"]}>
          <Link
            href="/retailers"
            className="inline-block space-x-4 transition-all duration-300 group-hover:scale-110"
            title="retailers"
          >
            <svg
              className="inline-block w-10"
              width="30"
              height="30"
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.12493 8.33333C6.82656 8.33333 6.54041 8.46503 6.32943 8.69945C6.11845 8.93387 5.99992 9.25181 5.99992 9.58333V15.4167C5.99992 16.1067 6.50393 16.6667 7.12493 16.6667H22.8751C23.1734 16.6667 23.4596 16.535 23.6706 16.3005C23.8816 16.0661 24.0001 15.7482 24.0001 15.4167V9.58333C24.0001 9.25181 23.8816 8.93387 23.6706 8.69945C23.4596 8.46503 23.1734 8.33333 22.8751 8.33333H7.12493ZM8.24994 14.1667V10.8333H21.7501V14.1667H8.24994ZM17.625 18.3333C17.3267 18.3333 17.0405 18.465 16.8295 18.6994C16.6185 18.9339 16.5 19.2518 16.5 19.5833V23.75C16.5 24.44 17.004 25 17.625 25H22.8751C23.1734 25 23.4596 24.8683 23.6706 24.6339C23.8816 24.3995 24.0001 24.0815 24.0001 23.75V19.5833C24.0001 19.2518 23.8816 18.9339 23.6706 18.6994C23.4596 18.465 23.1734 18.3333 22.8751 18.3333H17.625ZM18.75 22.5V20.8333H21.7501V22.5H18.75ZM2.9999 0C2.33951 3.22825e-05 1.69759 0.24217 1.17368 0.688863C0.649769 1.13556 0.273149 1.76184 0.102227 2.47059C-0.0686951 3.17934 -0.0243681 3.93095 0.228333 4.60886C0.481035 5.28677 0.927989 5.85309 1.49988 6.22V28.75C1.49988 29.44 2.00389 30 2.62489 30H27.3751C27.6735 30 27.9596 29.8683 28.1706 29.6339C28.3816 29.3995 28.5001 29.0815 28.5001 28.75V6.22C29.072 5.85309 29.519 5.28677 29.7717 4.60886C30.0244 3.93095 30.0687 3.17934 29.8978 2.47059C29.7268 1.76184 29.3502 1.13556 28.8263 0.688863C28.3024 0.24217 27.6605 3.22825e-05 27.0001 0H2.9999ZM26.2501 6.66667V27.5H14.25V19.5833C14.25 19.2518 14.1315 18.9339 13.9205 18.6994C13.7095 18.465 13.4234 18.3333 13.125 18.3333H7.12493C6.82656 18.3333 6.54041 18.465 6.32943 18.6994C6.11845 18.9339 5.99992 19.2518 5.99992 19.5833V27.5H3.7499V6.66667H26.2501ZM2.24989 3.33333C2.24989 3.11232 2.32891 2.90036 2.46956 2.74408C2.61021 2.5878 2.80098 2.5 2.9999 2.5H27.0001C27.199 2.5 27.3898 2.5878 27.5304 2.74408C27.6711 2.90036 27.7501 3.11232 27.7501 3.33333C27.7501 3.55435 27.6711 3.76631 27.5304 3.92259C27.3898 4.07887 27.199 4.16667 27.0001 4.16667H2.9999C2.80098 4.16667 2.61021 4.07887 2.46956 3.92259C2.32891 3.76631 2.24989 3.55435 2.24989 3.33333ZM12 27.5H8.24994V20.8333H12V27.5Z"
                fill="white"
              />
            </svg>

            {isMenuExpanded && <span className="inline-block">Retailers</span>}
          </Link>
        </Tabs.Item>

        <Tabs.Item accessableBy={["super-admin", "company", "retailer"]}>
          <Link
            href="/products"
            className="inline-block space-x-4 transition-all duration-300 group-hover:scale-110"
            title="products"
          >
            <svg
              width="24"
              height="31"
              viewBox="0 0 24 31"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="inline-block w-10"
            >
              <path
                d="M22.5 12.1667H24V30.5H0V12.1667H1.5V8.83336C1.5 4.23337 4.86 0.500039 9 0.500039C10.065 0.500039 11.085 0.750038 12 1.20004C12.9446 0.73502 13.9668 0.4965 15 0.500039C19.14 0.500039 22.5 4.23337 22.5 8.83336V12.1667ZM4.5 8.83336V12.1667H7.5V8.83336C7.5 6.95003 8.085 5.23337 9.03 3.83337H9C6.525 3.83337 4.5 6.08337 4.5 8.83336ZM19.5 12.1667V8.83336C19.5 6.08337 17.475 3.83337 15 3.83337H14.97C15.9563 5.2705 16.4935 7.02606 16.5 8.83336V12.1667H19.5ZM12 5.13337C11.085 6.05003 10.5 7.3667 10.5 8.83336V12.1667H13.5V8.83336C13.5 7.3667 12.915 6.05003 12 5.13337Z"
                fill="white"
              />
            </svg>

            {isMenuExpanded && <span className="inline-block">Products</span>}
          </Link>
        </Tabs.Item>

        <Tabs.Item accessableBy={["super-admin", "company"]}>
          <Link
            href="/company-sales"
            className="inline-block space-x-4 transition-all duration-300 group-hover:scale-110"
            title="company-sales"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 28 28"
              className="inline-block h-7 w-10"
            >
              <g
                id="Layer_2"
                data-name="Layer 2"
              >
                <g
                  id="Layer_1-2"
                  data-name="Layer 1"
                >
                  <path
                    d="M24.86,26.71c.83,0,1.62,0,2.4,0a1,1,0,0,1,.65.36c.27.43-.09.91-.67.91-1.39,0-2.77,0-4.15,0H1.32c-.24,0-.48,0-.71,0A.62.62,0,0,1,0,27.33a.59.59,0,0,1,.64-.62c.8,0,1.6,0,2.48,0v-.6c0-6,0-15.9,0-21.91,0-.84.16-1,1-1h8.3c0-.18,0-.34,0-.5V1c0-.76.19-1,.92-1H23.9c.79,0,1,.19,1,1V26.71ZM13.69,1.31V26.68h2c0-.17,0-.32,0-.47V20.77c0-.78.16-.95.91-1h4c.72,0,.89.19.89.93v5.94h2.06V1.31ZM12.37,26.68V4.5h-8V26.68ZM17.05,21v5.41h3.18V21Z"
                    fill="#fff"
                  />
                  <path
                    d="M18.63,16.19H21c.53,0,.72.19.72.73v1.56c0,.47-.21.69-.69.69h-4.9c-.47,0-.68-.22-.68-.7s0-1.07,0-1.61.2-.67.69-.67C17,16.18,17.81,16.19,18.63,16.19Zm-2,1.82h4v-.66h-4Z"
                    fill="#fff"
                  />
                  <path
                    d="M18.63,7.19H21c.53,0,.72.19.72.73V9.48c0,.47-.21.69-.69.69h-4.9c-.47,0-.68-.22-.68-.7s0-1.07,0-1.61.2-.67.69-.67C17,7.18,17.81,7.19,18.63,7.19ZM16.62,9h4V8.35h-4Z"
                    fill="#fff"
                  />
                  <path
                    d="M18.62,15.1H16.17c-.49,0-.68-.19-.68-.68s0-1,0-1.56.19-.72.69-.73h4.89c.49,0,.68.21.68.69s0,1,0,1.57-.18.7-.7.71Zm-2-1.82v.66h4v-.66Z"
                    fill="#fff"
                  />
                  <path
                    d="M18.66,3.09h2.41c.48,0,.68.21.69.68s0,1.1,0,1.65a.56.56,0,0,1-.64.64q-2.49,0-5,0a.57.57,0,0,1-.64-.64c0-.57,0-1.13,0-1.69a.57.57,0,0,1,.65-.64Zm-2,1.82h4V4.24h-4Z"
                    fill="#fff"
                  />
                  <path
                    d="M8.43,17.58h-2c-.59,0-.77-.17-.78-.76s0-1,0-1.56.19-.65.64-.65h4.21c.42,0,.6.2.61.63s0,1.12,0,1.69-.2.64-.67.65C9.79,17.59,9.11,17.58,8.43,17.58Zm-1.6-1.16H10v-.66H6.83Z"
                    fill="#fff"
                  />
                  <path
                    d="M8.44,13.6h-2c-.54,0-.74-.19-.75-.72s0-1.07,0-1.6.22-.66.68-.66h4.13c.45,0,.65.2.66.63s0,1.12,0,1.68-.21.66-.67.67ZM6.83,12.45H10v-.68H6.83Z"
                    fill="#fff"
                  />
                  <path
                    d="M8.44,9.6h-2c-.54,0-.74-.19-.75-.72s0-1.07,0-1.6.22-.66.68-.66h4.13c.45,0,.65.2.66.63s0,1.12,0,1.68-.21.66-.67.67ZM6.83,8.45H10V7.77H6.83Z"
                    fill="#fff"
                  />
                  <path
                    d="M8.41,21.56h-2c-.51,0-.71-.2-.72-.7s0-1.07,0-1.6.21-.67.67-.67h4.13c.46,0,.66.21.67.66s0,1.1,0,1.65-.2.66-.69.67ZM6.83,20.4H10v-.65H6.83Z"
                    fill="#fff"
                  />
                  <circle
                    fill="#017082"
                    cx="18.78"
                    cy="11.84"
                    r="4.1"
                  />
                  <path
                    d="M17.79,12.61h.35c.06,0,.08,0,.08.08a.63.63,0,0,0,0,.19.59.59,0,0,0,.93.3.49.49,0,0,0,0-.69,1.23,1.23,0,0,0-.36-.23c-.25-.13-.52-.24-.78-.37a1.17,1.17,0,0,1-.19-1.81,1.45,1.45,0,0,1,.69-.31c.06,0,.08,0,.08-.09s0-.28,0-.43,0-.1.1-.1H19c.07,0,.1,0,.1.1v.42c0,.07,0,.1.09.12a1.16,1.16,0,0,1,.94,1.12c0,.19,0,.19-.18.19h-.51c-.13,0-.13,0-.14-.12a.6.6,0,0,0-.11-.37.47.47,0,0,0-.5-.17.41.41,0,0,0-.33.35.49.49,0,0,0,.27.56c.19.11.39.18.58.28a3.2,3.2,0,0,1,.54.32,1.05,1.05,0,0,1,.39,1,1.1,1.1,0,0,1-1,1c-.08,0-.12,0-.11.13s0,.24,0,.36,0,.09-.08.09h-.31c-.06,0-.08,0-.08-.07s0-.25,0-.36,0-.14-.12-.15a1.18,1.18,0,0,1-.54-.2,1.14,1.14,0,0,1-.53-.89c0-.24,0-.24.22-.24Z"
                    fill="#fff"
                  />
                  <path
                    d="M18.78,16.46a4.62,4.62,0,1,1,4.61-4.62A4.63,4.63,0,0,1,18.78,16.46Zm0-8.43a3.81,3.81,0,1,0,3.8,3.81A3.82,3.82,0,0,0,18.78,8Z"
                    fill="#fff"
                  />
                  <path
                    d="M16,16a.43.43,0,0,0-.45-.43H14.26a.43.43,0,0,0-.47.42.44.44,0,0,0,.45.45h.27l-3.41,3.4h0L9.34,18.08a.43.43,0,0,0-.68,0l-.05.05-3,3-.19.19L5,21.74a.42.42,0,0,0,0,.62.39.39,0,0,0,.29.13.46.46,0,0,0,.33-.14l.07-.06L9,19H9v0l.75.74,1,1a.44.44,0,0,0,.72,0l1.13-1.13.74-.73L15.12,17v.27a.44.44,0,0,0,.74.33.41.41,0,0,0,.12-.31C16,16.88,16,16.43,16,16Z"
                    fill="#fff"
                  />
                </g>
              </g>
            </svg>

            {isMenuExpanded && <span className="inline-block">Company Sales</span>}
          </Link>
        </Tabs.Item>

        <Tabs.Item accessableBy={["super-admin", "retailer"]}>
          <Link
            href="/retailer-sales"
            className="inline-block space-x-4 transition-all duration-300 group-hover:scale-110"
            title="retailer-sales"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 28 28"
              className="inline-block h-7 w-10"
            >
              <g
                id="Layer_2"
                data-name="Layer 2"
              >
                <g
                  id="Layer_1-2"
                  data-name="Layer 1"
                >
                  <path
                    d="M.53,26.28H25.61a.5.5,0,0,0,.52-.54V23.56a.5.5,0,0,0-.52-.54H23.55V12.49a3,3,0,0,0,1.53-2.55V8.31A.81.81,0,0,0,25,7.93L22.81,4.07V.54A.51.51,0,0,0,22.28,0H3.91a.51.51,0,0,0-.53.54V4.13L1.16,8v.1c0,.06,0,.11,0,.17h0V9.94a2.81,2.81,0,0,0,1.53,2.55V23H.53a.51.51,0,0,0-.53.54v2.18A.54.54,0,0,0,.53,26.28ZM24,9.94a1.78,1.78,0,0,1-1.74,1.79,1.84,1.84,0,0,1-1.8-1.79V8.85H24Zm-17.26,0V8.85h3.53V9.94a1.78,1.78,0,0,1-1.74,1.79A1.83,1.83,0,0,1,6.76,9.94Zm4.59,0V8.85h3.54V9.94a1.78,1.78,0,0,1-1.74,1.79A1.84,1.84,0,0,1,11.35,9.94Zm4.54,0V8.85h3.54V9.94a1.78,1.78,0,0,1-1.74,1.79A1.84,1.84,0,0,1,15.89,9.94ZM4.43,1.09H21.75v2.6H4.43ZM4.22,4.78H22L23.7,7.71H2.53ZM2.16,8.85H5.7V9.94A1.78,1.78,0,0,1,4,11.73,1.78,1.78,0,0,1,2.22,9.94V8.85Zm1.75,4a2.68,2.68,0,0,0,2.27-1.25,2.8,2.8,0,0,0,2.27,1.25,2.75,2.75,0,0,0,2.27-1.25A2.81,2.81,0,0,0,13,12.81a2.75,2.75,0,0,0,2.27-1.25,2.81,2.81,0,0,0,2.27,1.25,2.74,2.74,0,0,0,2.27-1.25,2.81,2.81,0,0,0,2.27,1.25h.21V23H3.7V12.81ZM1.06,24.11h24v1.08h-24Z"
                    fill="#fff"
                  />
                  <ellipse
                    fill="#017082"
                    cx="22.8"
                    cy="22.65"
                    rx="4.63"
                    ry="4.76"
                  />
                  <path
                    d="M21.69,23.54h.39a.08.08,0,0,1,.09.09.91.91,0,0,0,0,.23.66.66,0,0,0,1.05.34.57.57,0,0,0,0-.8,1.53,1.53,0,0,0-.4-.26c-.29-.15-.59-.28-.88-.44a1.37,1.37,0,0,1-.22-2.09,1.55,1.55,0,0,1,.78-.36c.07,0,.09,0,.09-.1v-.5c0-.08,0-.12.11-.11h.32c.08,0,.11,0,.11.11v.49a.11.11,0,0,0,.1.13,1.33,1.33,0,0,1,1.07,1.3c0,.23,0,.23-.2.23h-.59c-.14,0-.14,0-.15-.15a.75.75,0,0,0-.13-.43.51.51,0,0,0-.56-.19.46.46,0,0,0-.37.41.57.57,0,0,0,.3.64c.22.13.45.22.66.33a4.65,4.65,0,0,1,.61.36,1.33,1.33,0,0,1-.69,2.32c-.09,0-.13.05-.13.15s0,.28,0,.42,0,.1-.09.1h-.36c-.06,0-.08,0-.08-.09s0-.28,0-.42,0-.15-.14-.16a1.42,1.42,0,0,1-1.21-1.27c0-.28,0-.28.26-.28Z"
                    fill="#fff"
                  />

                  <path
                    d="M22.8,28A5.35,5.35,0,1,1,28,22.65,5.29,5.29,0,0,1,22.8,28Zm0-9.77a4.42,4.42,0,1,0,4.29,4.42A4.37,4.37,0,0,0,22.8,18.23Z"
                    fill="#fff"
                  />
                  <path
                    d="M18,14.5a.43.43,0,0,0-.43-.43H16.3a.42.42,0,0,0-.45.42.43.43,0,0,0,.44.44h.25l-3.28,3.38h0l-1.68-1.73a.42.42,0,0,0-.66,0l-.05.05L8,19.57l-.18.19-.43.44a.43.43,0,0,0,0,.62.41.41,0,0,0,.29.13A.48.48,0,0,0,8,20.81l.07-.07,3.18-3.27h0v0l.72.73.93,1a.42.42,0,0,0,.7,0l1.08-1.11.71-.73,1.75-1.79a.34.34,0,0,1,0,.1,1,1,0,0,0,0,.17.41.41,0,0,0,.7.32.39.39,0,0,0,.12-.3C18,15.39,18,14.94,18,14.5Z"
                    fill="#fff"
                  />
                </g>
              </g>
            </svg>

            {isMenuExpanded && <span className="inline-block">Retailer Sales</span>}
          </Link>
        </Tabs.Item>
      </Tabs>

      {/* Displaying companyName and userType at the bottom */}
      {isMenuExpanded && (
        <div className="mt-auto p-4">
          <div className="rounded bg-gray-200 p-2 text-center text-sm shadow-sm">
            <p className="font-semibold text-gray-900"> {userData.companyName}</p>
            <p className="font-semibold text-gray-900"> {userData.userType}</p>
          </div>
        </div>
      )}
    </div>
  )
}
