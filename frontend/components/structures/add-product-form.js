"use client"

import { useAddProductForm } from "@/contexts/add-product-form-context"
import React, { useCallback, useState } from "react"
import AnimatedInput from "../composites/animated-input"
import Richtext from "../blocks/richtext"
import Button from "../elements/button"
import Input from "../elements/input"
import { twMerge } from "tailwind-merge"
import InputGroupWithLabel from "../blocks/input-group-with-label"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { reactQueryStaleTime } from "@/utils/staticUtils"
import { createNewProduct, fetchProductTypes, fetchBatchIds } from "@/contexts/query-provider/api-request-functions/api-requests"
import { capitalize, selectOptionWithHeading } from "@/utils/functionalUtils"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import RadioGroup from "../blocks/radio-group"
import Radio from "../elements/radio"
import InputBatch from "../elements/inputbatch"

export default function AddProductFormTemplate() {
  const router = useRouter()
  const { handleSubmit, register, getValues, errors, } = useAddProductForm()

  const queryClient = useQueryClient()
  const [selectedProductType, setSelectedProductType] = useState({})

  // Fetch product types
  const productTypes = useQuery({
    queryKey: ["fetchProductTypes"],
    queryFn: fetchProductTypes,
    staleTime: reactQueryStaleTime,
  })
  const productTypeOptions = selectOptionWithHeading(productTypes.data?.data)

  // Fetch batch IDs
const batchIdsQuery = useQuery({
  queryKey: ["fetchBatchIds"],
  queryFn: fetchBatchIds,
  staleTime: reactQueryStaleTime,
});

  const batchIdOptions = batchIdsQuery.data?.data || []; // Assuming response.data contains an array of batch IDs

  const handleProductTypeChange = useCallback((e) => {
    const productTypeObject = productTypes.data?.data.find((productType) => productType._id === e.target.value)
    setSelectedProductType(productTypeObject)
  }, [productTypes.data?.data])

  const addProductMutation = useMutation({
    mutationFn: (dataToPost) => createNewProduct(dataToPost),
    onSuccess: (response) => {
      toast.success(response.message)
      queryClient.invalidateQueries({ queryKey: ["fetchProducts"] })
      router.push("/products")
    },
    onError: (error) => toast.error(error.data.message),
  })

  // Function to handle form submission
  const submitFn = (formData) => {
    addProductMutation.mutate({
      ...formData,
      productAttributes: Object.keys(formData.productAttributes).map((eachAttribute) => ({
        attributeName: eachAttribute,
        attributeValue: formData.productAttributes[eachAttribute],
      })),
    })
  }

  return (
    <div className="space-y-6">
      <div className="space-y-10 rounded-md border-2 border-gray-200 bg-white p-6">
        {/* <div
          className={twMerge(
            "rounded-md border-2 border-[#bbb] px-4 pb-8",
            errors && errors["productStatus"] ? "border-red-600" : "",
          )}
        >
          <RadioGroup
            label="Product Status"
            name="productStatus"
            register={register}
            fieldRule={{ required: { value: true, message: "status required" } }}
            errors={errors}
            wrapperClassName="-my-3"
          >
            <Radio label="Pending" value="pending" />
            <Radio label="Completed" value="completed" />
            <Radio label="Cancelled" value="cancelled" />
          </RadioGroup>
        </div> */}

        <InputGroupWithLabel wrapperClassName="p-0" cols={2}>
          <AnimatedInput
            placeholder="Company Name"
            required
            disabled
            register={register}
            errors={errors}
            getValues={getValues}
            name="productManufacturer"
          />

          <AnimatedInput
            placeholder="Product Name"
            required
            register={register}
            errors={errors}
            getValues={getValues}
            name="productName"
            fieldRule={{ required: "This field is required" }}
          />
        </InputGroupWithLabel>

        <InputGroupWithLabel wrapperClassName="p-0" cols={2}>
          <AnimatedInput
            type="number"
            placeholder="Price"
            required
            register={register}
            errors={errors}
            getValues={getValues}
            name="productPrice"
            fieldRule={{ required: "This field is required" }}
          />

          <Input
            type="select"
            className={twMerge("rounded-md border-2 border-[#bbb]", errors.productType ? "border-red-600" : "")}
            options={productTypeOptions}
            onChange={handleProductTypeChange}
            register={register}
            name="productType"
            fieldRule={{ required: { value: true, message: "product type required" } }}
            defaultValue=""
          />
        </InputGroupWithLabel>

        <AnimatedInput
          placeholder="Product SKU"
          required
          register={register}
          errors={errors}
          getValues={getValues}
          name="productSku"
          fieldRule={{ required: "This field is required" }}
        />
<InputGroupWithLabel wrapperClassName="p-0" cols={2}>
  <InputBatch
    type="select"
    className={twMerge("rounded-md border-2 border-[#bbb]", errors.batchId ? "border-red-600" : "")}
    options={batchIdOptions.map(batchId => (
      {
        key: batchId.batchId,  
        value: batchId.batchId,
        label: batchId.batchId
      }
    ))}

    register={register}
        name="batchId"
    fieldRule={{ required: { value: true, message: "Batch ID required" } }}
    defaultValue=""
  />
</InputGroupWithLabel>
        <Richtext
          name="productDescription"
          placeholder="Description"
          formContext={useAddProductForm}
          required
        />
      </div>

      {/* Attributes Section */}
      <div className="space-y-6 rounded-md border-2 border-gray-200 bg-white p-6">
        {selectedProductType.attributes?.map((attribute, idx) => (
          <div className="flex items-center gap-8" key={idx}>
            <span className="w-48">{capitalize(attribute.attributeName)}</span>

            <Input
              className="flex-grow rounded-md border-2 border-[#bbb] px-2 py-1 outline-none"
              placeholder={attribute.attributeName}
              register={register}
              name={`productAttributes.${attribute.attributeName}`}
              fieldRule={{ required: { value: true, message: `${attribute.attributeName} attribute required` } }}
            />
          </div>
        ))}
      </div>
      <div>
        <div>
          <Button
            className="bg-[#017082] px-12 py-2 text-white"
            onClick={handleSubmit(submitFn)}
            disabled={addProductMutation.isPending}
          >
            <span className="flex h-6 w-16 items-center justify-center">
              {addProductMutation.isPending ? (
                <span className="inline-block size-4 animate-spin rounded-full border-2 border-white border-t-gray-400" />
              ) : (
                <span>Save</span>
              )}
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
}
