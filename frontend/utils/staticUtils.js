export const userTypeOptions = [
  { value: "", text: "----- Select A Type -----" },
  { value: "company", text: "Company" },
  { value: "retailer", text: "Retailer" },
]

export const productTypeStatus = {
  true: "enabled",
  false: "disabled",
}

export const routeToCrumb = {
  "product-types": "Product Types",
  "add-product-type": "Add Product Type",
  companies: "Companies",
  products: "Products",
  retailers: "Retailers",
  dashboard: "Dashboard",
  "company-sales": "Company Sales",
  "retailer-sales": "Retailer Sales",
}

export const reactQueryStaleTime = Infinity