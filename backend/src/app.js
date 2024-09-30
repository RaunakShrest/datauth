import express from "express"
import http from "http"
import dotenv from "dotenv"
import morgan from "morgan"
import cors from "cors"
import multer from "multer"

dotenv.config("../.env")
const app = express()
const server = http.createServer(app)
const upload = multer()

// boilerplate middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static("../public"))
app.use(morgan("tiny"))
app.use(upload.none())

app.get("/", (req, res) => {
  return res.send("Hello JS Developer")
})

// app specific middlewares
import usersRoute from "./routes/user.route.js"
import productTypesRoute from "./routes/productType.router.js"
import productItemsRoute from "./routes/productItem.router.js"
import customerInfoRoute from "./routes/customerInfo.router.js"
import retailerRoute from "./routes/retailer.route.js"
app.use("/api/v1/users", usersRoute)
app.use("/api/v1/product-types", productTypesRoute)
app.use("/api/v1/products", productItemsRoute)
app.use("/api/v1/customer-info", customerInfoRoute)
app.use("/api/v1/retailers",retailerRoute)
// Global Error Handler
app.use((error, _, res, __) => {
  console.log(error)
  if (!error.statusCode) {
    error.statusCode = 500
    error.success = false
    error.data = null
  }
  if (!error.message) {
    error.message = "something went wrong"
  }
  return res.status(error.statusCode).json(error)
})
app.all('*', (req, res) => {
  return res.status(404).json({ error: 'Route not found!' });
});
export { server }
