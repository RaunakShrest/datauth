"use client"

import React from "react"
import Switch from "../elements/switch"
import { useFormContext } from "@/contexts/add-product-type-form-context"
import Button from "../elements/button"
import AnimatedInput from "../composites/animated-input"
import Richtext from "../blocks/richtext"
import ProductTypeAttributes from "../blocks/product-type-attributes"
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useFieldArray } from "react-hook-form"
import Input from "../elements/input"
import { twMerge } from "tailwind-merge"
import { useMutation } from "@tanstack/react-query"
import { productTypeStatus } from "@/utils/staticUtils"
import { createNewProductType } from "@/contexts/query-provider/api-request-functions/api-requests"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

export default function AddProdcutTypeFormTemplate() {
  const { handleSubmit, register, control, errors, watch, getValues } = useFormContext()

  const router = useRouter()

  const { fields, append, remove } = useFieldArray({
    control,
    name: "productTypeAttributes",
    rules: {
      required: {
        value: true,
        message: "At least 1 attribute required",
      },
    },
  })

  const addProductType = useMutation({
    mutationFn: (data) => createNewProductType(data),
    onSuccess: (response) => {
      toast.success(response.message)

      router.push("/product-types")
    },
    onError: (error) => toast.error(error.data.message),
  })

  const submitFn = (formData) => {
    addProductType.mutate({
      name: formData.productTypeName,
      description: formData.productTypeDescription,
      status: productTypeStatus[formData.productTypeStatus],
      attributes: formData.productTypeAttributes,
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-6 rounded-md border-2 border-gray-200 bg-white p-6">
        <Switch
          name="productTypeStatus"
          register={register}
          watch={watch}
        />

        <AnimatedInput
          placeholder="Name"
          getValues={getValues}
          required
          register={register}
          errors={errors}
          name="productTypeName"
          fieldRule={{ required: "This field is required" }}
        />

        <Richtext
          name="productTypeDescription"
          placeholder="Description"
          formContext={useFormContext}
          required
        />
      </div>

      <div className="space-y-6 rounded-md border-2 border-gray-200 bg-white p-6">
        <ProductTypeAttributes>
          <div className="space-y-4">
            {fields.map((field, idx) => (
              <div
                key={field.id}
                className="flex gap-2"
              >
                <Input
                  name={`productTypeAttributes.${idx}.attributeName`}
                  className={twMerge(
                    "rounded-md border-2 border-[#bbb]",
                    errors?.productTypeAttributes ? (errors.productTypeAttributes[idx] ? "border-red-600" : "") : "",
                  )}
                  register={register}
                  fieldRule={{ required: { value: true, message: "attribute name required" } }}
                  placeholder="Attribute Name"
                />

                <Button
                  className="bg-red-600 text-white"
                  onClick={() => remove(idx)}
                  disabled={fields.length <= 1}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </div>
            ))}
          </div>

          {errors.productTypeAttributes?.root && (
            <p className="text-center text-red-600">{errors.productTypeAttributes?.root?.message}</p>
          )}
          <div className="text-center">
            <Button
              className="bg-[#017082] text-white"
              onClick={() => append({ attributeName: "" })}
            >
              <FontAwesomeIcon icon={faPlus} /> Add Attribute
            </Button>
          </div>
        </ProductTypeAttributes>
      </div>

      <div>
        <div>
          <Button
            className="bg-[#017082] px-12 py-2 text-white"
            onClick={handleSubmit(submitFn)}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}
