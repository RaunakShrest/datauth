"use client"

import { capitalize } from "@/utils/functionalUtils"
import { productTypeStatus } from "@/utils/staticUtils"
import React, { useId } from "react"

export default function Switch({ state, className, register, name, watch, ...props }) {
  const elementId = useId()

  return (
    <>
      <div className="flex items-center gap-2">
        <input
          className="checkbox-switch"
          id={elementId}
          type="checkbox"
          {...register(name)}
          {...props}
          hidden
        />

        <label
          htmlFor={elementId}
          className="flex items-center"
        >
          <span className="checkbox-switch"></span>
        </label>

        <span className="inline-block">{capitalize(productTypeStatus[watch(name)] ?? productTypeStatus.false)}</span>
      </div>
    </>
  )
}
