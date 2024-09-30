"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

const ProductTypeContext = React.createContext();

export const useProductType = () => {
  const context = React.useContext(ProductTypeContext);

  if (!context) {
    throw new Error("use useProductType within the scope of ProductTypeProvider");
  }

  return context;
};

export default function ProductTypeProvider({ children }) {
  const [isAsc, setIsAsc] = useState(true);
  const [data, setData] = useState({
    data: [],
    columns: [
      { id: "product-type-name", text: "PT Name", dataKey: "productTypeName", isSortable: true, isWide: false },
      {
        id: "product-type-description",
        text: "PT Description",
        dataKey: "productTypeDescription",
        isSortable: false,
        isWide: true,
      },
      { id: "product-type-status", text: "Status", dataKey: "status", isSortable: true, isWide: false },
    ],
  });
  const [selectedData, setSelectedData] = useState([]);

  const fetchProductTypes = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL_DEV}/product-types/get-all`);
      setData((prev) => ({ ...prev, data: response.data.data || [] }));
    } catch (error) {
      console.error("Error fetching product types data:", error);
    }
  };

  useEffect(() => {
    fetchProductTypes();
  }, []);

  // Sort data based on the provided basis
  const sortData = (basis) => {
    setIsAsc((prev) => !prev); // Toggle sort direction

    const dataCopy = [...data.data];
    const sortedData = dataCopy?.sort((a, b) =>
      isAsc ? (a[basis] > b[basis] ? 1 : -1) : a[basis] < b[basis] ? 1 : -1
    );

    setData((prev) => ({ ...prev, data: sortedData }));
  };

  return (
    <ProductTypeContext.Provider
      value={{ data, setData, sortData, selectedData, setSelectedData, fetchProductTypes }} // Include fetchProductTypes
    >
      {children}
    </ProductTypeContext.Provider>
  );
}
