"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "../elements/button";
import axios from "axios";
import toast from "react-hot-toast";

export default function EditSingleProductForm({ params }) {
  const { 'single-product': productId } = params; // Get productId from params
  const router = useRouter();

  const [product, setProduct] = useState(null);  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    productName: "",
    productSku: "",
    productPrice: "",
    productDescription: "",
  });

  // Fetch the product details
  useEffect(() => {
    async function fetchProductDetails() {
      if (!productId) return;

      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL_DEV}/products/getSingleProduct/${productId}`);
        const productData = response.data.data;
        setProduct(productData);
        setFormData({
          productName: productData.productName || "",
          productPrice: productData.productPrice || "",
          productDescription: productData.productDescription || "",
          productSku: productData.productSku || "",
        });
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("Failed to fetch product details");
      } finally {
        setLoading(false);
      }
    }

    fetchProductDetails();
  }, [productId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const getChangedFields = () => {
    const updatedFields = {};

    for (const key in formData) {
      if (formData[key] !== product?.[key] && formData[key] !== "") {
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
        `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/products/editProductDetails/${productId}`,
        updatedData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Product edited successfully");
      router.replace(`/products`);
    } catch (error) {
      setError("Failed to update product");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>Product Name</label>
          <input
            type="text"
            name="productName"
            value={formData.productName}
            onChange={handleChange}
            className="border px-2 py-1 w-full"
          />
        </div>
        <div>
          <label>Price</label>
          <input
            type="text"
            name="productPrice"
            value={formData.productPrice}
            onChange={handleChange}
            className="border px-2 py-1 w-full"
          />
        </div>
        <div>
          <label>Description</label>
          <textarea
            name="productDescription"
            value={formData.productDescription}
            onChange={handleChange}
            className="border px-2 py-1 w-full"
          />
        </div>
        <div>
          <label>SKU</label>
          <input
            type="text"
            name="productSku"
            value={formData.productSku}
            onChange={handleChange}
            className="border px-2 py-1 w-full"
          />
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
