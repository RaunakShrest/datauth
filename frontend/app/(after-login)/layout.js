import React from "react"
import Footer from "@/components/blocks/foooter"
import Header from "@/components/blocks/header"
import SideMenu from "@/components/blocks/side-menu"
import Breadcrumbs from "@/components/composites/breadcrumbs"
import MenuWrapper from "@/components/blocks/menu-wrapper"
import RequireAuth from "@/contexts/require-auth/require-auth"

export default function AfterLoginLayout({ children }) {
  return (
    <RequireAuth>
      <div className="container">
        <div className="sticky top-0 mt-8 flex gap-4">
          <MenuWrapper>
            <div className="sticky top-0 h-screen rounded-md bg-[#017082] px-2 pt-8 text-white shadow-md">
              <SideMenu />
            </div>
          </MenuWrapper>

          <div className="flex-grow space-y-6 overflow-auto">
            <Header />

            <Breadcrumbs />

            {children}

            <Footer />
          </div>
        </div>
      </div>
    </RequireAuth>
  )
}
