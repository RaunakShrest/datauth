"use client"

import { routeToCrumb } from "@/utils/staticUtils"
import { faChevronRight } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Link from "next/link"
import { usePathname } from "next/navigation"
import React from "react"

export default function Breadcrumbs() {
  const pathname = usePathname()
  const pathnameArray = pathname === "/" ? ["", "dashboard"] : pathname?.split("/")
  const routesArray = pathnameArray.slice(1)

  let currentLink = null

  return (
    <div className="flex text-sm text-[#017082]">
      {routesArray.map((route, idx, arr) => {
        currentLink = currentLink ? currentLink + `/${route}` : `/${route}`

        return (
          <div key={idx}>
            {idx !== arr.length - 1 ? (
              <>
                <Link href={currentLink}>
                  <span>{routeToCrumb[route] ?? route}</span>
                </Link>

                <FontAwesomeIcon
                  className="mx-2 text-xs text-black"
                  icon={faChevronRight}
                />
              </>
            ) : (
              <span className="text-black">{routeToCrumb[route] ?? route}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
