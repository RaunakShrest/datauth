"use client"

import React, { useState } from "react"

const CompaniesContext = React.createContext()

export const useCompanies = () => {
  const context = React.useContext(CompaniesContext)

  if (!context) {
    throw new Error("use useCompanies within the scope of CompaniesProvider")
  }

  return context
}

export default function CompaniesProvider({ children }) {
  const [isAsc, setIsAsc] = useState(true)
  const [data, setData] = useState({
    data: [
      {
        status: "pending",
        name: "John Doe",
        companyName: "Tech Innovators",
        companyProductType: "Softwares",
        companyDescription:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. At aliquid ad nostrum quia doloremque hic aliquam cum, est quae voluptatum atque repellat corrupti voluptatibus? Culpa possimus consequuntur eos fuga in!",
      },
      {
        status: "approved",
        name: "Jane Smith",
        companyName: "Green Energy Corp",
        companyProductType: "Paper Cup",
        companyDescription:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. At aliquid ad nostrum quia doloremque hic aliquam cum, est quae voluptatum atque repellat corrupti voluptatibus? Culpa possimus consequuntur eos fuga in!",
      },
      {
        status: "approved",
        name: "Alice Johnson",
        companyName: "HealthWell Inc.",
        companyProductType: "Medication",
        companyDescription:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. At aliquid ad nostrum quia doloremque hic aliquam cum, est quae voluptatum atque repellat corrupti voluptatibus? Culpa possimus consequuntur eos fuga in!",
      },
      {
        status: "pending",
        name: "Michael Brown",
        companyName: "FinTech Solutions",
        companyProductType: "Software Products",
        companyDescription:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. At aliquid ad nostrum quia doloremque hic aliquam cum, est quae voluptatum atque repellat corrupti voluptatibus? Culpa possimus consequuntur eos fuga in!",
      },
      {
        status: "pending",
        name: "Emily Davis",
        companyName: "EduLearn",
        companyProductType: "Online Courses",
        companyDescription:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. At aliquid ad nostrum quia doloremque hic aliquam cum, est quae voluptatum atque repellat corrupti voluptatibus? Culpa possimus consequuntur eos fuga in!",
      },
      {
        status: "pending",
        name: "Robert Wilson",
        companyName: "AutoDrive Co.",
        companyProductType: "Vehicles",
        companyDescription:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. At aliquid ad nostrum quia doloremque hic aliquam cum, est quae voluptatum atque repellat corrupti voluptatibus? Culpa possimus consequuntur eos fuga in!",
      },
      {
        status: "rejected",
        name: "Laura Miller",
        companyName: "Urban Builders",
        companyProductType: "Bricks",
        companyDescription:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. At aliquid ad nostrum quia doloremque hic aliquam cum, est quae voluptatum atque repellat corrupti voluptatibus? Culpa possimus consequuntur eos fuga in!",
      },
      {
        status: "approved",
        name: "Foodie Delights",
        companyName: "Foodie Delights",
        companyProductType: "Food",
        companyDescription:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. At aliquid ad nostrum quia doloremque hic aliquam cum, est quae voluptatum atque repellat corrupti voluptatibus? Culpa possimus consequuntur eos fuga in!",
      },
      {
        status: "approved",
        name: "Patricia Martinez",
        companyName: "CloudNet Services",
        companyProductType: "Servers",
        companyDescription:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. At aliquid ad nostrum quia doloremque hic aliquam cum, est quae voluptatum atque repellat corrupti voluptatibus? Culpa possimus consequuntur eos fuga in!",
      },
      {
        status: "pending",
        name: "Christopher Lee",
        companyName: "SafeHome Security",
        companyProductType: "CCTV Cameras",
        companyDescription:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. At aliquid ad nostrum quia doloremque hic aliquam cum, est quae voluptatum atque repellat corrupti voluptatibus? Culpa possimus consequuntur eos fuga in!",
      },
    ],
    columns: [
      {
        id: "company-name",
        text: "Company Name",
        dataKey: "companyName",
        isSortable: true,
        width: "250px",
      },
      { id: "company-owner-name", text: "Name", dataKey: "name", isSortable: true, width: "250px" },
      {
        id: "company-description",
        text: "Company Description",
        dataKey: "companyDescription",
        isSortable: false,
        width: "350px",
      },
      {
        id: "company-product-type",
        text: "Product Type",
        dataKey: "companyProductType",
        isSortable: true,
        width: "150px",
      },
      { id: "company-status", text: "Status", dataKey: "status", isSortable: true, width: "100px" },
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
    <CompaniesContext.Provider value={{ data, setData, sortData, selectedData, setSelectedData }}>
      {children}
    </CompaniesContext.Provider>
  )
}
