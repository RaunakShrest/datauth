"use client"

import React, { createContext, useContext } from "react"
import { useForm } from "react-hook-form"

const SingleRetailerEditContext = createContext()

export const useSingleRetailerEdit = () => {
  const context = useContext(SingleRetailerEditContext)

  if (!context) {
    throw new Error("use useSingleCompanyEdit within the scope of EditSingleCompanyProvider")
  }

  return context
}

export default function EditSingleRetailerProvider({ children }) {
  const {
    handleSubmit,
    register,
    watch,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = useForm()

  return (
    <SingleRetailerEditContext.Provider value={{ handleSubmit, register, watch, setValue, getValues, control, errors }}>
      {children}
    </SingleRetailerEditContext.Provider>
  )
}
