"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const RetailersContext = createContext();

export const useRetailers = () => {
  const context = useContext(RetailersContext);

  if (!context) {
    throw new Error("use useRetailers within the context of RetailersProvider");
  }

  return context;
};

export default function RetailersProvider({ children }) {
  const [isAsc, setIsAsc] = useState(true);

  const [data, setData] = useState({
    data: [], // Initially empty, will be populated by API call
    columns: [
      {
        id: "retailer-name",
        text: "Retailer Name",
        dataKey: "retailerName",
        isSortable: true,
        width: "250px",
      },
      {
        id: "retail-owner-name",
        text: "Owner Name",
        dataKey: "name",
        isSortable: true,
        width: "250px",
      },
      {
        id: "phone",
        text: "Phone",
        dataKey: "phone",
        isSortable: false,
        width: "350px",
      },
      {
        id: "email",
        text: "Email",
        dataKey: "email",
        isSortable: true,
        width: "150px",
      },
      {
        id: "retailer-status",
        text: "Status",
        dataKey: "status",
        isSortable: true,
        width: "100px",
      },
    ],
  });
  const [selectedData, setSelectedData] = useState([]);

  const sortData = (basis) => {
    setIsAsc((prev) => !prev);
    const dataCopy = [...data.data];
    const sortedData = dataCopy?.sort((a, b) =>
      isAsc ? (a[basis] > b[basis] ? 1 : -1) : a[basis] < b[basis] ? 1 : -1
    );

    setData((prev) => ({ ...prev, data: sortedData }));
  };

  const fetchRetailers = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/retailers/getRetailers`
      );
      setData((prev) => ({
        ...prev,
        data: response.data.data || [],
      }));
    } catch (error) {
      console.error("Error fetching retailers data", error);
    }
  };

  useEffect(() => {
    fetchRetailers();
  }, []);

  return (
    <RetailersContext.Provider
      value={{ data, setData, sortData, selectedData, setSelectedData , fetchRetailers}}
    >
      {children}
    </RetailersContext.Provider>
  );
}
