"use client"

import React from "react"
import Input from "@/components/elements/input"
import { twMerge } from "tailwind-merge"

export default function InputWithIcon({
  useFormContext,
  iconElement,
  inputType,
  wrapperClassName,
  inputClassName,
  takesFullWidth,
  className, //if not used, when passed className prop, causes issues
  label,
  ...props
}) {
  const formContextValues = useFormContext()

  return (
    <div className={`space-y-2 ${takesFullWidth ? "col-start-1 -col-end-1" : ""}`}>
      {label && (
        <div>
          <label>
            {label} {props.inputAttributes.required && <span className="text-red-600">*</span>}
          </label>
        </div>
      )}

      <div>
        <div
          className={twMerge(
            "flex items-center rounded-md border-2 border-[#bbbbbb]",
            wrapperClassName,
            formContextValues?.errors[props.inputAttributes.name] ? "border-red-600" : "",
          )}
          {...props.wrapperAttributes}
        >
          {iconElement}

          <Input
            className={inputClassName}
            {...props.inputAttributes}
          />
        </div>

        {formContextValues?.errors[props.inputAttributes.name] && (
          <div>
            <span className="text-sm text-red-600">
              {formContextValues?.errors[props.inputAttributes.name]?.message}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
