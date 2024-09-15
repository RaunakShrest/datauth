import { api } from "@/lib/api"

export const getCurrentUser = async () => {
  try {
    const response = await api.get("/users/get-current-user")

    return response.data
  } catch (error) {
    // console.error(error.response.data.message)

    throw error.response
  }
}

export const signInUser = async (formData) => {
  try {
    const response = await api.post("/users/signin", formData)

    localStorage.setItem("accessToken", response.data?.data.accessToken)
    localStorage.setItem("refreshToken", response.data?.data.refreshToken)

    return response.data
  } catch (error) {
    throw error.response
  }
}

export const signOutUser = async () => {
  try {
    const response = await api.post("/users/signout")

    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")

    return response.data
  } catch (error) {
    throw error.response
  }
}

export const registerUser = async (data) => {
  try {
    const response = await api.post("/users/signup", data)

    return response.data
  } catch (error) {
    throw error.response
  }
}

export const createNewProductType = async (data) => {
  try {
    const response = await api.post("/product-types/create", data)

    return response.data
  } catch (error) {
    throw error.response
  }
}

export const fetchProductTypes = async () => {
  try {
    const response = await api.get("/product-types/get-enabled")

    return response.data
  } catch (error) {
    throw error.response
  }
}

export const createNewProduct = async (data) => {
  try {
    const response = await api.post("/products/create-product-item", data)

    return response.data
  } catch (error) {
    throw error.response
  }
}

export const fetchProducts = async () => {
  try {
    const response = await api.get("/products/get-product-items")

    return response.data
  } catch (error) {
    throw error.response
  }
}

export const fetchSingleProduct = async (productSlug) => {
  try {
    const response = await api.get(`/products/${productSlug}`)

    return response.data
  } catch (error) {
    throw error.response
  }
}
