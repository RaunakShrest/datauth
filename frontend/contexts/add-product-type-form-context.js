"use client"

import React from "react"
import { useForm } from "react-hook-form"

const FormContext = React.createContext()

export const useFormContext = () => {
  const context = React.useContext(FormContext)

  if (!context) {
    throw new Error("Please use form context within the scope of FormContextProvider")
  }

  return context
}

export default function FormContextProvider({ children }) {
  const {
    handleSubmit,
    register,
    watch,
    getValues,
    setValue,
    control,
    formState: { errors },
  } = useForm({ defaultValues: { productTypeAttributes: [{ attributeName: "" }] } })

  return (
    <FormContext.Provider value={{ handleSubmit, register, errors, watch, getValues, setValue, control }}>
      {children}
    </FormContext.Provider>
  )
}
