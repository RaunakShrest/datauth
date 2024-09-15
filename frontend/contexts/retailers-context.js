"use client"

import React, { createContext, useContext, useState } from "react"

const RetailersContext = createContext()

export const useRetailers = () => {
  const context = useContext(RetailersContext)

  if (!context) {
    throw new Error("use useRetailers within the context of RetailersProvider")
  }

  return context
}

export default function RetailersProvider({ children }) {
  const [isAsc, setIsAsc] = useState(true)

  const [data, setData] = useState({
    data: [
      {
        status: "pending",
        name: "John Doe",
        retailerName: "Tech Innovators",
        retailerProductType: "Softwares",
        retailerDescription:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. At aliquid ad nostrum quia doloremque hic aliquam cum, est quae voluptatum atque repellat corrupti voluptatibus? Culpa possimus consequuntur eos fuga in!",
      },
      {
        status: "approved",
        name: "Jane Smith",
        retailerName: "Green Energy Corp",
        retailerProductType: "Paper Cup",
        retailerDescription:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. At aliquid ad nostrum quia doloremque hic aliquam cum, est quae voluptatum atque repellat corrupti voluptatibus? Culpa possimus consequuntur eos fuga in!",
      },
      {
        status: "approved",
        name: "Alice Johnson",
        retailerName: "HealthWell Inc.",
        retailerProductType: "Medication",
        retailerDescription:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. At aliquid ad nostrum quia doloremque hic aliquam cum, est quae voluptatum atque repellat corrupti voluptatibus? Culpa possimus consequuntur eos fuga in!",
      },
      {
        status: "pending",
        name: "Michael Brown",
        retailerName: "FinTech Solutions",
        retailerProductType: "Software Products",
        retailerDescription:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. At aliquid ad nostrum quia doloremque hic aliquam cum, est quae voluptatum atque repellat corrupti voluptatibus? Culpa possimus consequuntur eos fuga in!",
      },
      {
        status: "pending",
        name: "Emily Davis",
        retailerName: "EduLearn",
        retailerProductType: "Online Courses",
        retailerDescription:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. At aliquid ad nostrum quia doloremque hic aliquam cum, est quae voluptatum atque repellat corrupti voluptatibus? Culpa possimus consequuntur eos fuga in!",
      },
      {
        status: "pending",
        name: "Robert Wilson",
        retailerName: "AutoDrive Co.",
        retailerProductType: "Vehicles",
        retailerDescription:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. At aliquid ad nostrum quia doloremque hic aliquam cum, est quae voluptatum atque repellat corrupti voluptatibus? Culpa possimus consequuntur eos fuga in!",
      },
      {
        status: "rejected",
        name: "Laura Miller",
        retailerName: "Urban Builders",
        retailerProductType: "Bricks",
        retailerDescription:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. At aliquid ad nostrum quia doloremque hic aliquam cum, est quae voluptatum atque repellat corrupti voluptatibus? Culpa possimus consequuntur eos fuga in!",
      },
      {
        status: "approved",
        name: "Foodie Delights",
        retailerName: "Foodie Delights",
        retailerProductType: "Food",
        retailerDescription:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. At aliquid ad nostrum quia doloremque hic aliquam cum, est quae voluptatum atque repellat corrupti voluptatibus? Culpa possimus consequuntur eos fuga in!",
      },
      {
        status: "approved",
        name: "Patricia Martinez",
        retailerName: "CloudNet Services",
        retailerProductType: "Servers",
        retailerDescription:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. At aliquid ad nostrum quia doloremque hic aliquam cum, est quae voluptatum atque repellat corrupti voluptatibus? Culpa possimus consequuntur eos fuga in!",
      },
      {
        status: "pending",
        name: "Christopher Lee",
        retailerName: "SafeHome Security",
        retailerProductType: "CCTV Cameras",
        retailerDescription:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. At aliquid ad nostrum quia doloremque hic aliquam cum, est quae voluptatum atque repellat corrupti voluptatibus? Culpa possimus consequuntur eos fuga in!",
      },
    ],
    columns: [
      {
        id: "retailer-name",
        text: "Retailer Name",
        dataKey: "retailerName",
        isSortable: true,
        width: "250px",
      },
      { id: "retail-owner-name", text: "Name", dataKey: "name", isSortable: true, width: "250px" },
      {
        id: "retailer-description",
        text: "Retailer Description",
        dataKey: "retailerDescription",
        isSortable: false,
        width: "350px",
      },
      {
        id: "retailer-product-type",
        text: "Product Type",
        dataKey: "retailerProductType",
        isSortable: true,
        width: "150px",
      },
      { id: "retailer-status", text: "Status", dataKey: "status", isSortable: true, width: "100px" },
    ],
  })
  const [selectedData, setSelectedData] = useState([])

  const sortData = (basis) => {
    setIsAsc((prev) => !prev)
    const dataCopy = [...data.data]
    const sortedData = dataCopy?.sort((a, b) => (isAsc ? (a[basis] > b[basis] ? 1 : -1) : a[basis] < b[basis] ? 1 : -1))

    setData((prev) => ({ ...prev, data: sortedData }))
  }

  return (
    <RetailersContext.Provider value={{ data, setData, sortData, selectedData, setSelectedData }}>
      {children}
    </RetailersContext.Provider>
  )
}
