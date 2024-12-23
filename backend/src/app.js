import express from "express";
import http from "http";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import multer from "multer";
import path from "path";

dotenv.config("../.env");
const app = express();
const server = http.createServer(app);
const upload = multer();

// boilerplate middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("../public"));
app.use(morgan("tiny"));

app.get("/", (req, res) => {
  return res.send("Hello JS Developer");
});

// app specific middlewares
import usersRoute from "./routes/user.route.js";

import companyRoute from "./routes/company.route.js";

app.use("/api/v1/users", usersRoute);

app.use("/api/v1/company", companyRoute);

// Serve static files from the uploads directory
app.use("/api/v1/uploads", express.static(path.join(process.cwd(), "uploads"))); // Update path to use process.cwd()

// Global Error Handler
app.use((error, _, res, __) => {
  console.log("global handle", error);
  if (!error.statusCode) {
    error.statusCode = 500;
    error.success = false;
    error.data = null;
  }
  if (!error.message) {
    error.message = "something went wrong";
  }
  return res.status(error.statusCode).json(error);
});

app.all("*", (req, res) => {
  return res.status(404).json({ error: "Route not found!" });
});

export { server };
