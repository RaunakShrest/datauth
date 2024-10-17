"use client"
import EditSingleProductTypeForm from "@/components/structures/edit-productTypeForm"
import EditSingleProductTypeProvider from "@/contexts/edit-single-productType-form"
import {useParams } from "next/navigation"
import React from "react"

export default function EditSingleProductType() {
  const params = useParams()
  
  return( 
  <div>
    <EditSingleProductTypeProvider>
  <EditSingleProductTypeForm params={params} />
  </EditSingleProductTypeProvider>

</div>
  )
}

