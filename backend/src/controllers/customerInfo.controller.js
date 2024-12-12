import { CustomerInfoModel } from "../models/customerInfo.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ProductItemModel } from "../models/productItem.model.js";
import { UserModel } from "../models/user.model.js";
import axios from "axios";
import crypto from "crypto";

import sendBulkEmail from "../middlewares/sendEmail.middleware.js";

// const postCustomerInfo = async (req, res, next) => {
//   try {
//     const blockChainToken = req.blockChainToken;
//     const { name, email, phoneNumber, soldProducts, soldBy } = req.body;

//     // Validate required fields
//     if (!name || !email || !soldProducts || !soldBy) {
//       throw new ApiError(400, "Missing required fields");
//     }

//     // Check if product and company exist
//     const product = await ProductItemModel.findById(soldProducts).populate(
//       "productManufacturer"
//     );
//     const companyUser = await UserModel.findById(soldBy);

//     if (!product) {
//       throw new ApiError(404, "Product not found");
//     }
//     if (!companyUser) {
//       throw new ApiError(404, "Company not found");
//     }

//     const productManufacturer = {
//       _id: product.productManufacturer._id,
//       companyName: product.productManufacturer.companyName,
//     };

//     const batchDetails = {
//       _id: product.batchId._id,
//       batchId: product.batchId.batchId,
//     };

//     const existingCustomer = await CustomerInfoModel.findOne({
//       "soldProducts._id": soldProducts,
//     });
//     const companyEmail = companyUser.email;

//     let customerInfo;
//     if (existingCustomer) {
//       // Check if data is identical to avoid duplicate entries
//       const isDataSame =
//         existingCustomer.name === name &&
//         existingCustomer.email === email &&
//         existingCustomer.phoneNumber === phoneNumber &&
//         existingCustomer.productManufacturer._id.toString() ===
//           productManufacturer._id.toString() &&
//         existingCustomer.batchId._id.toString() === batchDetails._id.toString();

//       if (isDataSame) {
//         return res
//           .status(409)
//           .json(
//             new ApiResponse(
//               409,
//               null,
//               "Customer data already exists. No changes made."
//             )
//           );
//       }

//       // Update customer info
//       existingCustomer.name = name;
//       existingCustomer.email = email;
//       existingCustomer.phoneNumber = phoneNumber;
//       existingCustomer.productManufacturer = productManufacturer;
//       existingCustomer.batchId = batchDetails;

//       customerInfo = await existingCustomer.save();

//       // Send update emails
//       const customerUpdateEmailOptions = [
//         {
//           from: process.env.SENDER_ADDRESS,
//           to: email,
//           subject: "Your Information has been Updated",
//           text: `Dear ${name}, your customer information has been updated successfully with order number: ${existingCustomer.orderId.orderNumber}.`,
//           html: `<p>Dear ${name},</p><p>Your customer information has been updated successfully with order number: <strong>${existingCustomer.orderId.orderNumber}</strong>.</p>`,
//         },
//       ];

//       const companyEmailOptions = [
//         {
//           from: process.env.SENDER_ADDRESS,
//           to: companyEmail,
//           subject: "Customer Information Notification",
//           text: `A customer record has been updated for product ID: ${soldProducts} with order number: ${existingCustomer.orderId.orderNumber}.`,
//           html: `<p>A customer record has been updated for product ID: ${soldProducts} with order number: ${existingCustomer.orderId.orderNumber}.</p>`,
//         },
//       ];

//       await sendBulkEmail([
//         ...customerUpdateEmailOptions,
//         ...companyEmailOptions,
//       ]);
//     } else {
//       // Create a new customer with auto-incremented orderId
//       const newCustomerInfo = new CustomerInfoModel({
//         name,
//         email,
//         phoneNumber,
//         soldProducts: {
//           _id: product._id,
//           productName: product.productName,
//           productPrice: product.productPrice,
//         },
//         soldBy: {
//           _id: companyUser._id,
//           companyName: companyUser.companyName,
//         },
//         batchId: batchDetails,
//         productManufacturer,
//       });

//       customerInfo = await newCustomerInfo.save();

//       // Update product status
//       await ProductItemModel.findByIdAndUpdate(
//         soldProducts,
//         { soldBy, productStatus: "completed", purchasedStatus: "true" },
//         { new: true }
//       );

//       // Send creation emails
//       const customerCreationEmailOptions = [
//         {
//           from: process.env.SENDER_ADDRESS,
//           to: email,
//           subject: "Product Purchased",
//           text: `Dear ${name}, Thank you for purchasing our product. Your order number is: ${customerInfo.orderId.orderNumber}.`,
//           html: `<p>Dear ${name},</p><p>Thank you for purchasing our product. Your order number is: <strong>${customerInfo.orderId.orderNumber}</strong>.</p>`,
//         },
//       ];

//       const companyEmailOptions = [
//         {
//           from: process.env.SENDER_ADDRESS,
//           to: companyEmail,
//           subject: "Customer Information Notification",
//           text: `A customer record has been created for product ID: ${soldProducts} with order number: ${customerInfo.orderId.orderNumber}.`,
//           html: `<p>A customer record has been created for product ID: ${soldProducts} with order number: ${customerInfo.orderId.orderNumber}.</p>`,
//         },
//       ];

//       await sendBulkEmail([
//         ...customerCreationEmailOptions,
//         ...companyEmailOptions,
//       ]);
//     }

//     // Blockchain API call
//     const blockchainPayload = {
//       fcn: "CreateCustomer",
//       args: [
//         customerInfo._id.toString(),
//         customerInfo.name,
//         customerInfo.email,
//         customerInfo.phoneNumber,
//         JSON.stringify(customerInfo.productManufacturer),
//         JSON.stringify(customerInfo.soldProducts),
//         JSON.stringify(customerInfo.soldBy),
//         JSON.stringify(customerInfo.batchId),
//         JSON.stringify(customerInfo.orderId),
//         customerInfo.createdAt,
//         customerInfo.updatedAt,
//       ],
//     };

//     try {
//       const blockchainResponse = await axios.post(
//         `${process.env.BLOCKCHAIN_TEST_URL}/channels/mychannel/chaincodes/Customer`,
//         blockchainPayload,
//         {
//           headers: {
//             Authorization: `Bearer ${blockChainToken}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       console.log("Blockchain API response:", blockchainResponse.data);
//     } catch (blockchainError) {
//       console.error("Blockchain API error:", blockchainError.message);
//       // Handle blockchain API error gracefully
//     }

//     // Send appropriate response to the client
//     return res
//       .status(existingCustomer ? 200 : 201)
//       .json(
//         new ApiResponse(
//           existingCustomer ? 200 : 201,
//           customerInfo,
//           existingCustomer
//             ? "Customer info updated successfully"
//             : "Customer info created successfully"
//         )
//       );
//   } catch (error) {
//     next(error);
//   }
// };

const postCustomerInfo = async (req, res, next) => {
  try {
    const blockChainToken = req.blockChainToken;
    const { name, email, phoneNumber, soldProducts, soldBy } = req.body;

    // Validate required fields
    if (!name || !email || !soldProducts || !soldBy) {
      throw new ApiError(400, "Missing required fields");
    }

    // Check if product and company exist
    const product = await ProductItemModel.findById(soldProducts).populate(
      "productManufacturer"
    );
    const companyUser = await UserModel.findById(soldBy);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }
    if (!companyUser) {
      throw new ApiError(404, "Company not found");
    }

    const productManufacturer = {
      _id: product.productManufacturer._id,
      companyName: product.productManufacturer.companyName,
    };

    const batchDetails = {
      _id: product.batchId._id,
      batchId: product.batchId.batchId,
    };

    // Check if a customer record already exists for the given product
    const existingCustomer = await CustomerInfoModel.findOne({
      "soldProducts._id": soldProducts,
    });

    let customerInfo;

    if (existingCustomer) {
      // Perform update (edit operation)
      existingCustomer.name = name;
      existingCustomer.email = email;
      existingCustomer.phoneNumber = phoneNumber;
      existingCustomer.productManufacturer = productManufacturer;
      existingCustomer.batchId = batchDetails;

      customerInfo = await existingCustomer.save();

      // Blockchain API payload for "EditCustomer"
      const blockchainPayload = {
        fcn: "EditCustomer",
        args: [
          customerInfo._id.toString(),
          customerInfo.name,
          customerInfo.email,
          customerInfo.phoneNumber,
          JSON.stringify(customerInfo.productManufacturer),
          JSON.stringify(customerInfo.soldProducts),
          JSON.stringify(customerInfo.soldBy),
          JSON.stringify(customerInfo.batchId),
          JSON.stringify(customerInfo.orderId),
          customerInfo.createdAt,
          customerInfo.updatedAt,
        ],
      };

      try {
        const blockchainResponse = await axios.post(
          "http://192.168.1.97:4000/channels/mychannel/chaincodes/Customer",
          blockchainPayload,
          {
            headers: {
              Authorization: `Bearer ${blockChainToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Blockchain API response:", blockchainResponse.data);
      } catch (blockchainError) {
        console.error("Blockchain API error:", blockchainError.message);
        // Handle blockchain API error gracefully
      }

      // Send update email
      const customerUpdateEmailOptions = [
        {
          from: process.env.SENDER_ADDRESS,
          to: email,
          subject: "Your Information has been Updated",
          text: `Dear ${name}, your customer information has been updated successfully with order number: ${existingCustomer.orderId.orderNumber}.`,
          html: `<p>Dear ${name},</p><p>Your customer information has been updated successfully with order number: <strong>${existingCustomer.orderId.orderNumber}</strong>.</p>`,
        },
      ];

      await sendBulkEmail(customerUpdateEmailOptions);

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            customerInfo,
            "Customer info updated successfully"
          )
        );
    } else {
      // Perform creation (new customer)
      const newCustomerInfo = new CustomerInfoModel({
        name,
        email,
        phoneNumber,
        soldProducts: {
          _id: product._id,
          productName: product.productName,
          productPrice: product.productPrice,
        },
        soldBy: {
          _id: companyUser._id,
          companyName: companyUser.companyName,
        },
        batchId: batchDetails,
        productManufacturer,
      });

      customerInfo = await newCustomerInfo.save();
      await ProductItemModel.findByIdAndUpdate(
        soldProducts,
        { soldBy, productStatus: "completed", purchasedStatus: "true" },
        { new: true }
      );

      // Blockchain API payload for "CreateCustomer"
      const blockchainPayload = {
        fcn: "CreateCustomer",
        args: [
          customerInfo._id.toString(),
          customerInfo.name,
          customerInfo.email,
          customerInfo.phoneNumber,
          JSON.stringify(customerInfo.productManufacturer),
          JSON.stringify(customerInfo.soldProducts),
          JSON.stringify(customerInfo.soldBy),
          JSON.stringify(customerInfo.batchId),
          JSON.stringify(customerInfo.orderId),
          customerInfo.createdAt,
          customerInfo.updatedAt,
        ],
      };

      try {
        const blockchainResponse = await axios.post(
          "http://192.168.1.97:4000/channels/mychannel/chaincodes/Customer",
          blockchainPayload,
          {
            headers: {
              Authorization: `Bearer ${blockChainToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Blockchain API response:", blockchainResponse.data);
      } catch (blockchainError) {
        console.error("Blockchain API error:", blockchainError.message);
        // Handle blockchain API error gracefully
      }

      // Send creation email
      const customerCreationEmailOptions = [
        {
          from: process.env.SENDER_ADDRESS,
          to: email,
          subject: "Product Purchased",
          text: `Dear ${name}, Thank you for purchasing our product. Your order number is: ${customerInfo.orderId.orderNumber}.`,
          html: `<p>Dear ${name},</p><p>Thank you for purchasing our product. Your order number is: <strong>${customerInfo.orderId.orderNumber}</strong>.</p>`,
        },
      ];

      await sendBulkEmail(customerCreationEmailOptions);

      return res
        .status(201)
        .json(
          new ApiResponse(
            201,
            customerInfo,
            "Customer info created successfully"
          )
        );
    }
  } catch (error) {
    next(error);
  }
};

// const getSoldProductsByRetailer = async (req, res, next) => {
//   try {
//     const {
//       page = 1,
//       limit = 10,
//       productNameSearch = "",
//       retailerNameSearch = "",
//       customerNameSearch = "",
//       companyNameSearch = "",
//       startDate,
//       endDate,
//     } = req.query;
//     const retailerId = req.user._id;
//     const userType = req.user.userType;

//     const options = {
//       page: parseInt(page, 10),
//       limit: parseInt(limit, 10),
//     };

//     let query = {};

//     // Restrict query for retailers
//     if (userType === "retailer") {
//       if (!retailerId) {
//         return res.status(400).json({
//           status: 400,
//           message: "Retailer ID is required for retailer access",
//         });
//       }
//       query["soldBy._id"] = retailerId;
//     }

//     if (productNameSearch.trim() !== "") {
//       query["soldProducts.productName"] = {
//         $regex: productNameSearch,
//         $options: "i",
//       };
//     }

//     if (retailerNameSearch.trim() !== "") {
//       query["soldBy.companyName"] = {
//         $regex: retailerNameSearch,
//         $options: "i",
//       };
//     }

//     if (customerNameSearch.trim() !== "") {
//       query["name"] = { $regex: customerNameSearch, $options: "i" };
//     }

//     if (companyNameSearch.trim() !== "") {
//       query["productManufacturer.companyName"] = {
//         $regex: companyNameSearch,
//         $options: "i",
//       };
//     }
//     if (startDate || endDate) {
//       query["createdAt"] = {};

//       // Convert and validate startDate
//       if (startDate) {
//         const parsedStartDate = new Date(startDate);
//         if (!isNaN(parsedStartDate)) {
//           query["createdAt"]["$gte"] = parsedStartDate;
//         } else {
//           console.warn("Invalid startDate:", startDate);
//         }
//       }

//       // Convert and validate endDate
//       if (endDate) {
//         const parsedEndDate = new Date(endDate);
//         if (!isNaN(parsedEndDate)) {
//           // Add time to include the full day
//           parsedEndDate.setHours(23, 59, 59, 999);
//           query["createdAt"]["$lte"] = parsedEndDate;
//         } else {
//           console.warn("Invalid endDate:", endDate);
//         }
//       }
//     }

//     console.log("Query:", query); // Debugging

//     // Fetch sales data with pagination
//     const customerInfo = await CustomerInfoModel.find(query)
//       .skip((options.page - 1) * options.limit)
//       .limit(options.limit)
//       .exec();

//     const totalItems = await CustomerInfoModel.countDocuments(query);

//     res.status(200).json(
//       new ApiResponse(
//         200,
//         "Products sold by retailers retrieved successfully",
//         {
//           customerInfo,
//           pagination: {
//             totalItems,
//             totalPages: Math.ceil(totalItems / options.limit),
//             currentPage: options.page,
//           },
//         }
//       )
//     );
//   } catch (error) {
//     console.error("Error:", error); // Debugging
//     next(error);
//   }
// };

const getSoldProductsByRetailer = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      productNameSearch = "",
      retailerNameSearch = "",
      customerNameSearch = "",
      companyNameSearch = "",
      startDate,
      endDate,
    } = req.query;
    const retailerId = req.user._id;
    const userType = req.user.userType;

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      skip: (parseInt(page, 10) - 1) * parseInt(limit, 10),
    };

    let query = {};

    // Restrict query for retailers
    if (userType === "retailer") {
      if (!retailerId) {
        return res.status(400).json({
          status: 400,
          message: "Retailer ID is required for retailer access",
        });
      }
      query["soldBy._id"] = retailerId;
    }

    if (productNameSearch.trim() !== "") {
      query["soldProducts.productName"] = {
        $regex: productNameSearch,
        $options: "i",
      };
    }

    if (retailerNameSearch.trim() !== "") {
      query["soldBy.companyName"] = {
        $regex: retailerNameSearch,
        $options: "i",
      };
    }

    if (customerNameSearch.trim() !== "") {
      query["name"] = { $regex: customerNameSearch, $options: "i" };
    }

    if (companyNameSearch.trim() !== "") {
      query["productManufacturer.companyName"] = {
        $regex: companyNameSearch,
        $options: "i",
      };
    }

    if (startDate || endDate) {
      query["createdAt"] = {};

      if (startDate) {
        const parsedStartDate = new Date(startDate);
        if (!isNaN(parsedStartDate)) {
          query["createdAt"]["$gte"] = parsedStartDate;
        }
      }

      if (endDate) {
        const parsedEndDate = new Date(endDate);
        if (!isNaN(parsedEndDate)) {
          parsedEndDate.setHours(23, 59, 59, 999);
          query["createdAt"]["$lte"] = parsedEndDate;
        }
      }
    }

    const customerInfo = await CustomerInfoModel.find(query)
      .skip(options.skip)
      .limit(options.limit)
      .populate("batchId", "batchId")
      .populate("soldBy", "companyName _id")
      .populate("soldProducts", "productName productPrice")
      .populate("productManufacturer", "companyName _id");

    const totalItems = await CustomerInfoModel.countDocuments(query);

    const hashedCustomers = customerInfo.map((item) => {
      const customerData = {
        id: item?._id?.toString() || null,
        name: item?.name || null,
        email: item?.email || null,
        phoneNumber: item?.phoneNumber || null,
        productManufacturer: item?.productManufacturer
          ? {
              _id: item.productManufacturer._id?.toString() || null,
              companyName: item.productManufacturer.companyName || null,
            }
          : null,
        soldProducts: item?.soldProducts
          ? {
              _id: item.soldProducts._id?.toString() || null,
              productName: item.soldProducts.productName || null,
              productPrice: item.soldProducts.productPrice || null,
            }
          : null,
        soldBy: item?.soldBy
          ? {
              _id: item.soldBy._id?.toString() || null,
              companyName: item.soldBy.companyName || null,
            }
          : null,
        batchId: item?.batchId
          ? {
              _id: item.batchId._id?.toString() || null,
              batchId: item.batchId.batchId || null,
            }
          : null,
        orderId: item?.orderId
          ? {
              _id: item.orderId._id?.toString() || null,
              orderNumber: item.orderId.orderNumber || null,
            }
          : null,
        createdAt: item?.createdAt?.toISOString() || null,
        updatedAt: item?.updatedAt?.toISOString() || null,
      };

      const customerString = JSON.stringify(customerData);
      const customerHash = crypto
        .createHash("sha256")
        .update(customerString)
        .digest("hex");

      return {
        ...customerData,
        customerHash,
      };
    });

    const customerIdList = hashedCustomers.map((customer) => customer.id);

    let externalApiResponse = [];
    try {
      const payload = {
        fcn: "GetCustomerWithHash",
        args: customerIdList,
      };

      const blockchainToken = req.blockChainToken;
      console.log("the blockChaint oken issssss========", blockchainToken);
      if (!blockchainToken) {
        throw new ApiError(401, "Blockchain authorization token not found");
      }

      const response = await axios.post(
        `${process.env.BLOCKCHAIN_TEST_URL}/channels/mychannel/chaincodes/Customer`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${blockchainToken}`,
          },
        }
      );
      console.log("response of bses", response.data);

      if (
        response.data &&
        response.data.result &&
        Array.isArray(response.data.result.result)
      ) {
        externalApiResponse = response.data.result.result;
      }
    } catch (error) {
      console.error("Error fetching external API data:", error.message);
    }

    const comparisonResults = hashedCustomers.map((customer) => {
      const apiCustomer = externalApiResponse.find(
        (apiData) => apiData.id === customer.id // Match using `id` from blockchain response
      );

      // Log the hashes for debugging
      console.log("Customer ID:", customer.id);
      console.log("Generated Hash (Customer):", customer.customerHash);

      if (apiCustomer) {
        console.log("Blockchain Customer Data:", apiCustomer);
        console.log("Blockchain Hash:", apiCustomer.blockHash);

        const blockChainVerified =
          apiCustomer.blockHash === customer.customerHash ? true : "unverified";

        console.log("Verification Result:", blockChainVerified);

        return {
          ...customer,
          blockChainVerified,
        };
      } else {
        console.log(
          "No matching customer found in blockchain for ID:",
          customer.id
        );
        return {
          ...customer,
          blockChainVerified: false,
        };
      }
    });
    res.status(200).json(
      new ApiResponse(
        200,
        "Products sold by retailers retrieved successfully",
        {
          customerInfo: comparisonResults,
          pagination: {
            totalItems,
            totalPages: Math.ceil(totalItems / options.limit),
            currentPage: options.page,
          },
        }
      )
    );
  } catch (error) {
    console.error("Error:", error.message || "unknown error");
    next(error);
  }
};

const getCustomerInfo = async (req, res, next) => {
  try {
    const { productId } = req.query;
    if (!productId) {
      throw new ApiError(400, "Missing productId parameter");
    }

    // Check if product exists
    const productExists = await ProductItemModel.findById(productId);
    if (!productExists) {
      throw new ApiError(404, "Product not found");
    }

    // Fetch customer info related to the product using `soldProducts._id`
    const customerInfo = await CustomerInfoModel.findOne({
      "soldProducts._id": productId, // Check the _id inside soldProducts
    }).populate("soldProducts._id"); // Populate the referenced product item

    if (!customerInfo) {
      throw new ApiError(404, "Customer info not found for this product");
    }

    // Return the customer info
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          "Customer info retrieved successfully",
          customerInfo
        )
      );
  } catch (error) {
    next(error);
  }
};

const getSoldProductsByCompany = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      productNameSearch = "",
      batchIdSearch = "",
      retailerNameSearch = "",
      startDate,
      endDate,
    } = req.query;
    const blockChainToken = req.blockChainToken;
    const companyId = req.user._id;
    const userType = req.user.userType;

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      skip: (parseInt(page, 10) - 1) * parseInt(limit, 10),
    };

    // Build query object
    const query = {};

    // Filter by company for company users
    if (userType === "company") {
      if (!companyId) {
        throw new ApiError(400, "companyId not found");
      }
      query["productManufacturer._id"] = companyId;
    } else if (userType !== "super-admin") {
      throw new ApiError(403, "Unauthorized user type");
    }

    // Add product name search
    if (productNameSearch.trim() !== "") {
      query["soldProducts.productName"] = {
        $regex: productNameSearch,
        $options: "i",
      };
    }

    // Add batch ID search
    if (batchIdSearch.trim() !== "") {
      query["batchId.batchId"] = batchIdSearch;
    }

    if (retailerNameSearch.trim() !== "") {
      query["soldBy.companyName"] = {
        $regex: retailerNameSearch,
        $options: "i",
      };
    }

    // Add date range filter
    if (startDate || endDate) {
      query["createdAt"] = {};

      if (startDate) {
        const parsedStartDate = new Date(startDate);
        if (!isNaN(parsedStartDate)) {
          query["createdAt"]["$gte"] = parsedStartDate;
        }
      }

      if (endDate) {
        const parsedEndDate = new Date(endDate);
        if (!isNaN(parsedEndDate)) {
          parsedEndDate.setHours(23, 59, 59, 999);
          query["createdAt"]["$lte"] = parsedEndDate;
        }
      }
    }

    const companySalesData = await CustomerInfoModel.find(query)
      .skip(options.skip)
      .limit(options.limit)
      .populate("batchId", "batchId")
      .populate("soldBy", "companyName _id")
      .populate("soldProducts", "productName productPrice")
      .populate("productManufacturer", "companyName _id");

    const totalRecords = await CustomerInfoModel.countDocuments(query);

    const hashedSalesData = companySalesData.map((item) => {
      const saleData = {
        id: item?._id?.toString() || null,
        name: item?.name || null,
        email: item?.email || null,
        phoneNumber: item?.phoneNumber || null,
        productManufacturer: item?.productManufacturer
          ? {
              _id: item.productManufacturer._id?.toString() || null,
              companyName: item.productManufacturer.companyName || null,
            }
          : null,
        soldProducts: item?.soldProducts
          ? {
              _id: item.soldProducts._id?.toString() || null,
              productName: item.soldProducts.productName || null,
              productPrice: item.soldProducts.productPrice || null,
            }
          : null,
        soldBy: item?.soldBy
          ? {
              _id: item.soldBy._id?.toString() || null,
              companyName: item.soldBy.companyName || null,
            }
          : null,
        batchId: item?.batchId
          ? {
              _id: item.batchId._id?.toString() || null,
              batchId: item.batchId.batchId || null,
            }
          : null,
        createdAt: item?.createdAt?.toISOString() || null,
        updatedAt: item?.updatedAt?.toISOString() || null,
      };

      const saleString = JSON.stringify(saleData);
      const saleHash = crypto
        .createHash("sha256")
        .update(saleString)
        .digest("hex");

      return {
        ...saleData,
        saleHash,
      };
    });

    const saleIdList = hashedSalesData.map((sale) => sale.id);

    let externalApiResponse = [];
    try {
      const payload = {
        fcn: "GetCustomerWithHash",
        args: saleIdList,
      };

      if (!blockChainToken) {
        throw new ApiError(
          401,
          "Authorization token for external API not found"
        );
      }

      const response = await axios.post(
        `${process.env.BLOCKCHAIN_TEST_URL}/channels/mychannel/chaincodes/Customer`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${blockChainToken}`,
          },
        }
      );

      if (
        response.data &&
        response.data.result &&
        Array.isArray(response.data.result.result)
      ) {
        externalApiResponse = response.data.result.result;
      }
    } catch (error) {
      console.error("Error fetching external API data:", error.message);
    }

    const comparisonResults = hashedSalesData.map((sale) => {
      const apiSale = externalApiResponse.find(
        (apiData) => apiData.id === sale.id // Match using `id` from external API response
      );

      // Log the hashes for debugging
      console.log("Sale ID:", sale.id);
      console.log("Generated Hash (Company):", sale.saleHash);

      if (apiSale) {
        console.log("External API Sale Data:", apiSale);
        console.log("External API Hash:", apiSale.blockHash);

        const blockChainVerified =
          apiSale.blockHash === sale.saleHash ? true : "unverified";

        console.log("Verification Result:", blockChainVerified);

        return {
          ...sale,
          blockChainVerified,
        };
      } else {
        console.log("No matching sale found in external API for ID:", sale.id);
        return {
          ...sale,
          blockChainVerified: false,
        };
      }
    });

    res.status(200).json(
      new ApiResponse(200, "Sales data retrieved successfully", {
        salesData: comparisonResults,
        pagination: {
          totalRecords,
          totalPages: Math.ceil(totalRecords / options.limit),
          currentPage: options.page,
        },
      })
    );
  } catch (error) {
    console.error("Error:", error.message || "unknown error");
    next(error);
  }
};

const getProductWithOrderNumber = async (req, res, next) => {
  try {
    const { email, orderNumber } = req.query;
    if (!email || !orderNumber) {
      throw new ApiError(400, "Missing email or orderNumber parameter");
    }
    const customerInfo = await CustomerInfoModel.findOne({
      email: email,
      "orderId.orderNumber": orderNumber,
    });

    if (!customerInfo) {
      throw new ApiError(
        404,
        "Customer not found with the provided email and order number"
      );
    }

    const productItem = await ProductItemModel.findOne({
      _id: customerInfo.soldProducts,
    });

    if (!productItem) {
      throw new ApiError(
        404,
        "Product not found for the provided order number"
      );
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, "Product item retrieved successfully", productItem)
      );
  } catch (error) {
    next(error);
  }
};

export {
  postCustomerInfo,
  getSoldProductsByRetailer,
  getCustomerInfo,
  getSoldProductsByCompany,
  getProductWithOrderNumber,
};
