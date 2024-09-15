"use client"

import React, { useState } from "react"

const ProductTypeContext = React.createContext()

export const useProductType = () => {
  const context = React.useContext(ProductTypeContext)

  if (!context) {
    throw new Error("use useProductType within the scope of ProductTypeProvider")
  }

  return context
}

export default function ProductTypeProvider({ children }) {
  const [isAsc, setIsAsc] = useState(true)
  const [data, setData] = useState({
    data: [
      {
        status: "enabled",
        productTypeName: "Watch",
        productTypeDescription:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. At aliquid ad nostrum quia doloremque hic aliquam cum, est quae voluptatum atque repellat corrupti voluptatibus? Culpa possimus consequuntur eos fuga in!",
      },
      {
        status: "disabled",
        productTypeName: "Shoes",
        productTypeDescription:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. At aliquid ad nostrum quia doloremque hic aliquam cum, est quae voluptatum atque repellat corrupti voluptatibus? Culpa possimus consequuntur eos fuga in!",
      },
      {
        status: "enabled",
        productTypeName: "Slipper",
        productTypeDescription:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. At aliquid ad nostrum quia doloremque hic aliquam cum, est quae voluptatum atque repellat corrupti voluptatibus? Culpa possimus consequuntur eos fuga in!",
      },
      {
        status: "disabled",
        productTypeName: "Laptop",
        productTypeDescription:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. At aliquid ad nostrum quia doloremque hic aliquam cum, est quae voluptatum atque repellat corrupti voluptatibus? Culpa possimus consequuntur eos fuga in!",
      },
      {
        status: "enabled",
        productTypeName: "Mobile Phone",
        productTypeDescription:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. At aliquid ad nostrum quia doloremque hic aliquam cum, est quae voluptatum atque repellat corrupti voluptatibus? Culpa possimus consequuntur eos fuga in!",
      },
      {
        status: "disabled",
        productTypeName: "Mouse",
        productTypeDescription:
          "Lorem ipsum dolor sit amet consectetur adipisicing elit. At aliquid ad nostrum quia doloremque hic aliquam cum, est quae voluptatum atque repellat corrupti voluptatibus? Culpa possimus consequuntur eos fuga in!",
      },
    ],
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
  })
  const [selectedData, setSelectedData] = useState([])

  const sortData = async (basis) => {
    await Promise.resolve(setIsAsc((prev) => !prev)).catch((error) => {
      throw new Error(error)
    })

    const dataCopy = [...data.data]
    const sortedData = dataCopy?.sort((a, b) => (isAsc ? (a[basis] > b[basis] ? 1 : -1) : a[basis] < b[basis] ? 1 : -1))

    setData((prev) => ({ ...prev, data: sortedData }))
  }

  return (
    <ProductTypeContext.Provider value={{ data, setData, sortData, selectedData, setSelectedData }}>
      {children}
    </ProductTypeContext.Provider>
  )
}
