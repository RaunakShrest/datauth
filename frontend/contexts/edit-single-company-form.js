"use client"

import React, { createContext, useContext } from "react"
import { useForm } from "react-hook-form"

const SingleCompanyEditContext = createContext()

export const useSingleCompanyEdit = () => {
  const context = useContext(SingleCompanyEditContext)

  if (!context) {
    throw new Error("use useSingleCompanyEdit within the scope of EditSingleCompanyProvider")
  }

  return context
}

export default function EditSingleCompanyProvider({ children }) {
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
    <SingleCompanyEditContext.Provider value={{ handleSubmit, register, watch, setValue, getValues, control, errors }}>
      {children}
    </SingleCompanyEditContext.Provider>
  )
}
