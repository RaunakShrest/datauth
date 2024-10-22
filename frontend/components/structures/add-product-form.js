"use client";

import { useAddProductForm } from "@/contexts/add-product-form-context";
import React, { useCallback, useState } from "react";
import AnimatedInput from "../composites/animated-input";
import Richtext from "../blocks/richtext";
import Button from "../elements/button";
import Input from "../elements/input";
import { twMerge } from "tailwind-merge";
import InputGroupWithLabel from "../blocks/input-group-with-label";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { reactQueryStaleTime } from "@/utils/staticUtils";
import {
  createNewProduct,
  fetchProductTypes,
  fetchBatchIds,
} from "@/contexts/query-provider/api-request-functions/api-requests";
import { capitalize, selectOptionWithHeading } from "@/utils/functionalUtils";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import InputBatch from "../elements/inputbatch";

export default function AddProductFormTemplate() {
  const router = useRouter();
  const { handleSubmit, register, getValues, errors } = useAddProductForm();
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const queryClient = useQueryClient();
  const [selectedProductType, setSelectedProductType] = useState({});
  const [imageFiles, setImageFiles] = useState([]); // State for image files
  const [imagePreviews, setImagePreviews] = useState([]); // State for image previews

  // Fetch product types
  const productTypes = useQuery({
    queryKey: ["fetchProductTypes"],
    queryFn: fetchProductTypes,
    staleTime: reactQueryStaleTime,
  });
  const productTypeOptions = selectOptionWithHeading(productTypes.data?.data);

  // Fetch batch IDs
  const batchIdsQuery = useQuery({
    queryKey: ["fetchBatchIds"],
    queryFn: fetchBatchIds,
    staleTime: reactQueryStaleTime,
  });
  const batchIdOptions = batchIdsQuery.data?.data || []; // Assuming response.data contains an array of batch IDs

  const handleProductTypeChange = useCallback(
    (e) => {
      const productTypeObject = productTypes.data?.data.find(
        (productType) => productType._id === e.target.value
      );
      setSelectedProductType(productTypeObject);
    },
    [productTypes.data?.data]
  );

const addProductMutation = useMutation({
  mutationFn: (dataToPost) => createNewProduct(dataToPost),
  onSuccess: (response) => {
    toast.success(response.message);
    queryClient.invalidateQueries({ queryKey: ["fetchProducts"] });
    router.push("/products");  
  },
  onError: (error) => {
    console.error("Error adding product:", error);  
    toast.error(error?.response?.data?.message || "An error occurred while adding the product.");
  },
});

const submitFn = async (formData) => {
  try {
    if (imageFiles.length === 0) {
      toast.error("Please upload at least one image.");
      return;
    }

    const formDataToPost = new FormData();

    // Append image files
    imageFiles.forEach((file) => {
      formDataToPost.append('productItems', file);
    });

    // Append other form data
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "productAttributes") {
        const attributesArray = Object.entries(value).map(([attrName, attrValue]) => ({
          attributeName: attrName,
          attributeValue: attrValue,
        }));
        formDataToPost.append(key, JSON.stringify(attributesArray));
      } else {
        formDataToPost.append(key, value);
      }
    });
    addProductMutation.mutate(formDataToPost);

  } catch (error) {
    console.error("Error in submitFn:", error);
    toast.error("An error occurred during submission.");
  }
};


const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) {
        return; 
    }

    setImageFiles((prevFiles) => {
        const newFiles = [...prevFiles, ...files];
        return newFiles;
    });

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
};

  const removeImage = (index) => {
    setImageFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
    setImagePreviews((prevPreviews) => prevPreviews.filter((_, i) => i !== index));
  };

const handleBatchChange = (event) => {
  const selectedId = event.target.value;
  const selectedBatch = batchIdOptions.find(batch => batch._id === selectedId); // Find the selected batch object
  if (selectedBatch) {
    
    setSelectedBatchId(selectedBatch._id); 
  }
 
};


  return (
    <div className="space-y-6">
      <div className="space-y-10 rounded-md border-2 border-gray-200 bg-white p-6">
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
            className={twMerge(
              "rounded-md border-2 border-[#bbb]",
              errors.productType ? "border-red-600" : ""
            )}
            options={productTypeOptions}
            onChange={handleProductTypeChange}
            register={register}
            name="productType"
            fieldRule={{
              required: { value: true, message: "product type required" },
            }}
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
            className={twMerge(
              "rounded-md border-2 border-[#bbb]",
              errors.batchId ? "border-red-600" : ""
            )}
            options={batchIdOptions.map((batch) => ({
              key: batch._id, 
              value: batch._id, 
              label: batch.batchId, // Human-readable label
            }))}
            name="batchId"
            value={selectedBatchId} // This  holds the ObjectId
            onChange={handleBatchChange} // Update state when changed
            register={register}
            fieldRule={{ required: { value: true, message: "Batch ID required" } }}
          />
        </InputGroupWithLabel>

                {/* New Image Upload Section */}
          <input
          id="productItems"
          type="file"
          multiple
          name="productItems"
          accept="image/*"
          onChange={handleImageChange}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-opacity-50"
        />

        {/* Preview Selected Images */}
        <div className="mt-4">
          <h3 className="text-lg font-medium">Selected Images</h3>
          <div className="flex flex-wrap gap-4 mt-2">
            {imagePreviews.map((image, index) => (
              <div key={index} className="relative w-32 h-32 overflow-hidden border border-gray-300 rounded">
                <img src={image} alt={`Preview ${index + 1}`} className="object-cover w-full h-full" />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                  aria-label="Remove image"
                >
                  &times; {/* Cross icon */}
                </button>
              </div>
            ))}
          </div>
        </div>

        <Richtext
          name="productDescription"
          placeholder="Description"
          formContext={useAddProductForm}
          required
        />
      </div>

      {/* Attributes Section */}
      <div className="space-y-6 rounded-md border-2 border-gray-200 bg-white p-6">
        {selectedProductType.attributes && selectedProductType.attributes.length > 0 ? (
          selectedProductType.attributes.map((attribute, idx) => (
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
          ))
        ) : (
          <p>No attributes available for this product type.</p>
        )}
      </div>

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
  );
}
