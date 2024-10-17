"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../elements/button";
import axios from "axios";
import toast from "react-hot-toast";

export default function EditSingleProductTypeForm({ params }) {
  const { 'single-productType': productTypeId } = params; // Get productTypeId from params
  const router = useRouter();

  const [productType, setProductType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    attributes: [], // Initialize attributes as an empty array
  });

  useEffect(() => {
    async function fetchProductTypeDetails() {
      if (!productTypeId) return;

      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL_DEV}/product-types/getProductTypeById/${productTypeId}`);
        const productTypeData = response.data.data;
        setProductType(productTypeData);
        setFormData({
          name: productTypeData.name || "",
          description: productTypeData.description || "",
          attributes: productTypeData.attributes || [], // Populate attributes
        });
      } catch (err) {
        console.error("Error fetching product type details:", err);
        setError("Failed to fetch product type details");
      } finally {
        setLoading(false);
      }
    }

    fetchProductTypeDetails();
  }, [productTypeId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  // Handle attribute change
  const handleAttributeChange = (index, e) => {
    const { value } = e.target;
    setFormData((prevFormData) => {
      const updatedAttributes = [...prevFormData.attributes];
      updatedAttributes[index].attributeName = value;
      return {
        ...prevFormData,
        attributes: updatedAttributes,
      };
    });
  };

const getChangedFields = () => {
  const updatedFields = {};

  // Compare formData with the original productType object
  for (const key in formData) {
    if (key === "attributes") {
      const updatedAttributes = formData.attributes.map((attr, index) => 
        attr.attributeName !== productType.attributes?.[index]?.attributeName
      );
      if (updatedAttributes.length > 0) {
        updatedFields.attributes = formData.attributes.map(attr => ({
          attributeName: attr.attributeName
        })); // Ensure correct structure is sent
      }
    } else if (formData[key] !== productType?.[key] && formData[key] !== "") {
      updatedFields[key] = formData[key];
    }
  }

  return updatedFields;
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    const updatedData = getChangedFields();

    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/product-types/updateProductType/${productTypeId}`,
        updatedData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Product type edited successfully");
      router.replace(`/product-types`);
    } catch (error) {
      setError("Failed to update product type");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>Product Type Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="border px-2 py-1 w-full"
          />
        </div>
        <div>
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="border px-2 py-1 w-full"
          />
        </div>
        <div>
          <label>Attributes</label>
          {formData.attributes.map((attribute, index) => (
            <div key={index} className="space-y-2">
              <input
                type="text"
                name={`attribute-${index}`}
                value={attribute.attributeName}
                onChange={(e) => handleAttributeChange(index, e)}
                className="border px-2 py-1 w-full"
              />
            </div>
          ))}
        </div>
        <div>
          <Button type="submit" className="bg-[#017082] px-8 py-2 text-white">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
