"use client"

import React, { createContext, useContext } from "react"
import { useForm } from "react-hook-form"

const SingleProductTypeEditContext = createContext()

export const useSingleProductTypeEdit = () => {
  const context = useContext(SingleProductTypeEditContext)

  if (!context) {
    throw new Error("use useSingleProductTypeEdit within the scope of EditSingleProductProvider")
  }

  return context
}

export default function EditSingleProductTypeProvider({ children }) {
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
    <SingleProductTypeEditContext.Provider value={{ handleSubmit, register, watch, setValue, getValues, control, errors }}>
      {children}
    </SingleProductTypeEditContext.Provider>
  )
}
