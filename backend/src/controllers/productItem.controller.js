import slugify from "slugify";
import { ProductItemModel } from "../models/productItem.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ProductTypeModel } from "../models/productType.model.js";
import { slugSortingQuery } from "../utils/aggregations/slug-sorting-query.js";
import { generateUniqueSlug } from "../utils/aggregations/unique-slug-generator.js";
import { generateQr } from "../middlewares/qr-generator.middeware.js";
import { uploadFile } from "../middlewares/cloudinary.middleware.js";
import { BatchIdModal } from "../models/batchId.modal.js";
import mongoose from "mongoose";
import { UserModel } from "../models/user.model.js";
import axios from "axios";
import crypto from "crypto";

const acceptableStatus = () => [
  process.env.PRODUCT_ITEM_STATUS_PENDING,
  process.env.PRODUCT_ITEM_STATUS_COMPLETED,
  process.env.PRODUCT_ITEM_STATUS_CANCELLED,
];
// const getProductItems = async (req, res, next) => {
//   try {
//     const { page = 1, limit = 10, batchIdSearch } = req.query;
//     const userId = req.user?._id;
//     const isSuperAdmin = req.user?.userType === "super-admin";
//     const isRetailer = req.user?.userType === "retailer";

//     // Pagination options
//     const options = {
//       page: parseInt(page, 10),
//       limit: parseInt(limit, 10),
//       skip: (parseInt(page, 10) - 1) * parseInt(limit, 10),
//     };

//     // Build the filter based on user role and batchIdSearch
//     let filter =
//       isSuperAdmin || isRetailer ? {} : { "productManufacturer._id": userId };

//     if (batchIdSearch) {
//       filter["batchId.batchId"] = { $regex: batchIdSearch, $options: "i" };
//     }

//     // Query with filtering, pagination, and field exclusion
//     const productItems = await ProductItemModel.find(filter)
//       .skip(options.skip)
//       .limit(options.limit)
//       .select("-__v"); // Exclude the __v field

//     // Count total items for pagination
//     const totalItems = await ProductItemModel.countDocuments(filter);

//     // Send response
//     return res.status(200).json({
//       statusCode: 200,
//       data: {
//         productItems,
//         pagination: {
//           totalItems,
//           totalPages: Math.ceil(totalItems / options.limit),
//           currentPage: options.page,
//         },
//       },
//       message: "Product items fetched successfully",
//     });
//   } catch (error) {
//     console.error(
//       "Error fetching product items:",
//       error.message || "unknown error"
//     );
//     next(error);
//   }
// };
const getProductItems = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, batchIdSearch } = req.query;
    const userId = req.user?._id;
    const isSuperAdmin = req.user?.userType === "super-admin";
    const isRetailer = req.user?.userType === "retailer";

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      skip: (parseInt(page, 10) - 1) * parseInt(limit, 10),
    };

    let filter =
      isSuperAdmin || isRetailer ? {} : { "productManufacturer._id": userId };

    if (batchIdSearch) {
      filter["batchId.batchId"] = { $regex: batchIdSearch, $options: "i" };
    }

    const productItems = await ProductItemModel.find(filter)
      .skip(options.skip)
      .limit(options.limit)
      .populate("batchId", "batchId")
      .populate("productManufacturer", "companyName _id")
      .populate("productType", "name")
      .select(
        "productName productDescription productPrice productSku productStatus productAttributes productImages slug productWebLink createdAt updatedAt qrUrl batchId productManufacturer productType soldBy purchasedStatus"
      );

    const totalItems = await ProductItemModel.countDocuments(filter);

    if (!productItems || productItems.length === 0) {
      throw new ApiError(404, "No product items found");
    }

    const hashedProducts = productItems.map((product) => {
      const productData = {
        id: product._id.toString(),
        productName: product.productName,
        productDescription: product.productDescription,
        productPrice: product.productPrice,
        productSku: product.productSku,
        batchId: product.batchId
          ? {
              _id: product.batchId._id.toString(),
              batchId: product.batchId.batchId,
            }
          : null,
        productStatus: product.productStatus,
        productType: product.productType.map((type) => ({
          _id: type._id.toString(),
          name: type.name,
        })),
        productManufacturer: product.productManufacturer
          ? {
              _id: product.productManufacturer._id.toString(),
              companyName: product.productManufacturer.companyName,
            }
          : null,
        productAttributes: product.productAttributes.map((attr) => ({
          attributeName: attr.attributeName,
          attributeValue: attr.attributeValue,
          _id: attr._id.toString(),
        })),
        slug: product.slug,
        productImages: product.productImages,
        productWebLink: product.productWebLink,
        createdAt: product.createdAt.toISOString(),
        qrUrl: product.qrUrl,
        soldBy: product.soldBy,
        purchasedStatus: product.purchasedStatus,
      };

      const productString = JSON.stringify(productData);
      const hash = crypto
        .createHash("sha256")
        .update(productString)
        .digest("hex");

      return {
        ...productData,
        hash,
      };
    });

    // Prepare product IDs for external API request
    const productIdList = hashedProducts.map((product) => product.id);

    // Fetch data from external API
    let externalApiResponse = [];
    try {
      const payload = {
        fcn: "GetProductWithHash",
        args: productIdList,
      };

      const blockchainToken = req.blockChainToken;
      if (!blockchainToken) {
        throw new ApiError(401, "Blockchain authorization token not found");
      }

      const response = await axios.post(
        `${process.env.BLOCKCHAIN_TEST_URL}/channels/mychannel/chaincodes/Productitem`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${blockchainToken}`,
          },
        }
      );
      console.log("APi response data", response.data);

      if (
        response.data &&
        response.data.result &&
        Array.isArray(response.data.result.result)
      ) {
        externalApiResponse = response.data.result.result;
      } else {
        console.error(
          "Unexpected external API response format:",
          response.data
        );
      }
    } catch (error) {
      console.error("Error fetching external API data:", error.message);
    }

    // Compare hashes
    const comparisonResults = hashedProducts.map((product) => {
      const apiProduct = externalApiResponse.find(
        (apiData) => apiData.ProductId === product.id
      );

      if (apiProduct) {
        const blockChainVerified =
          apiProduct.blockHash === product.hash ? true : "unverified";
        console.log(`Product ID: ${product.id}`);
        console.log(`Generated Hash: ${product.hash}`);
        console.log(`API Hash: ${apiProduct.blockHash}`);
        console.log(`BlockChain Verified: ${blockChainVerified}`);

        return {
          ...product,
          blockChainVerified,
        };
      } else {
        return {
          ...product,
          blockChainVerified: false,
        };
      }
    });

    // Response
    return res.status(200).json({
      statusCode: 200,
      data: {
        productItems: comparisonResults,
        pagination: {
          totalItems,
          totalPages: Math.ceil(totalItems / options.limit),
          currentPage: options.page,
        },
      },
      message: "Product items fetched successfully",
    });
  } catch (error) {
    console.error(
      "Error in getProductItems:",
      error.message || "unknown error"
    );
    next(error);
  }
};

const getSingleProduct = async (req, res, next) => {
  try {
    const query = {
      _id: req.params?.productId,
    };

    const productItem = await ProductItemModel.findOne(query)
      .populate("productManufacturer", "companyName")
      .populate("productType", "name")
      .select("-__v");

    if (!productItem) {
      throw new ApiError(404, "Product doesn't exist");
    }

    // Prepare payload for blockchain token API
    const payload = {
      userid: productItem.productManufacturer?._id,
      orgName: "Company",
      companyName: productItem.productManufacturer?.companyName,
    };

    // Call blockchain token API
    const blockchainResponse = await axios.post(
      `${process.env.BLOCKCHAIN_TEST_URL}/users/token`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const blockChainToken = blockchainResponse.data.message.token;

    // Use blockchain token to access another API
    const productAccessPayload = {
      fcn: "GetProductWithHash",
      args: [productItem._id],
    };

    const productAccessResponse = await axios.post(
      `${process.env.BLOCKCHAIN_TEST_URL}/channels/mychannel/chaincodes/Productitem`,
      productAccessPayload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${blockChainToken}`,
        },
      }
    );

    const productAccessData = productAccessResponse.data.result;

    // Generate SHA-256 hash for the product data
    const productData = {
      id: productItem._id.toString(),
      productName: productItem.productName,
      productDescription: productItem.productDescription,
      productPrice: productItem.productPrice,
      productSku: productItem.productSku,
      batchId: productItem.batchId
        ? {
            _id: productItem.batchId._id.toString(),
            batchId: productItem.batchId.batchId,
          }
        : null,
      productStatus: productItem.productStatus,
      productType: productItem.productType.map((type) => ({
        _id: type._id.toString(),
        name: type.name,
      })),
      productManufacturer: productItem.productManufacturer
        ? {
            _id: productItem.productManufacturer._id.toString(),
            companyName: productItem.productManufacturer.companyName,
          }
        : null,
      productAttributes: productItem.productAttributes.map((attr) => ({
        attributeName: attr.attributeName,
        attributeValue: attr.attributeValue,
        _id: attr._id.toString(),
      })),
      slug: productItem.slug,
      productImages: productItem.productImages,
      productWebLink: productItem.productWebLink,
      createdAt: productItem.createdAt.toISOString(),
      qrUrl: productItem.qrUrl,
      soldBy: productItem.soldBy,
      purchasedStatus: productItem.purchasedStatus,
    };

    const productString = JSON.stringify(productData);
    const hash = crypto
      .createHash("sha256")
      .update(productString)
      .digest("hex");

    // Compare hash with blockchain data
    const externalProduct = productAccessData.result.find(
      (item) => item.ProductId === productItem._id.toString()
    );

    if (!externalProduct) {
      throw new ApiError(404, "Blockchain data for product not found");
    }

    const externalHash = externalProduct.blockHash;
    const blockChainVerified = externalHash === hash;

    // Add blockChainVerified to productItem
    const productWithVerification = {
      ...productItem.toObject(),
      blockChainVerified,
    };

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          productItem: productWithVerification,
        },
        "Product item fetched successfully"
      )
    );
  } catch (error) {
    if (!error.message) {
      error.message = "Something went wrong while getting product";
    }
    next(error);
  }
};

const getSingleProductOnSlug = async (req, res, next) => {
  console.log("htting product on slug");
  try {
    const userId = req.user?._id;

    if (!userId) {
      throw new ApiError(401, "Unauthorized request");
    }

    // Validate slug
    const slug = req.params?.slug;
    if (!slug || typeof slug !== "string") {
      throw new ApiError(400, "Invalid or missing slug parameter");
    }

    const query = { slug }; // Make sure to use the slug directly

    // Query the ProductItem collection by slug (not ObjectId)
    const productItem = await ProductItemModel.findOne(query)
      .populate("productManufacturer", "companyName")
      .populate("productType", "name")
      .select("-__v");

    if (!productItem) {
      throw new ApiError(404, "Product doesn't exist");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, productItem, "Product item fetched successfully")
      );
  } catch (error) {
    next(error);
  }
};

// const createProductItem = async (req, res, next) => {
//   const blockchainToken = req.blockchainToken;
//   try {
//     const productItemAcceptableStatus = acceptableStatus();
//     if (
//       !productItemAcceptableStatus ||
//       !Array.isArray(productItemAcceptableStatus)
//     ) {
//       throw new ApiError(500, "Acceptable status array is invalid");
//     }

//     const userId = req.user?._id;
//     if (!userId) {
//       throw new ApiError(404, "Unauthorized request");
//     }

//     const {
//       productName,
//       productType,
//       productSku,
//       productDescription,
//       productPrice,
//       batchId,
//       productStatus,
//       productAttributes,
//       productWebLink,
//     } = req.body;

//     const sanitizedStatus =
//       productStatus?.toLowerCase().replace(/['"]+/g, "").trim() || "completed";
//     if (!sanitizedStatus) {
//       throw new ApiError(400, "Product status is required");
//     }

//     const requestedProductType = await ProductTypeModel.findOne({
//       _id: productType,
//       status: process.env.PRODUCT_TYPE_STATUS_ENABLED,
//     });
//     if (!requestedProductType) {
//       throw new ApiError(
//         404,
//         "Requested product type does not exist or is disabled"
//       );
//     }
//     const requestedManufacturer = await UserModel.findById(userId);
//     if (!requestedManufacturer) {
//       throw new ApiError(404, "Manufacturer not found");
//     }

//     if (!mongoose.Types.ObjectId.isValid(batchId)) {
//       console.error("Batch ID is invalid:", batchId);
//       throw new ApiError(
//         400,
//         `Invalid batch ID format: ${batchId}. A valid batch ID must be a 24-character hexadecimal string.`
//       );
//     }

//     const requestedBatch = await BatchIdModal.findOne({ _id: batchId });
//     if (!requestedBatch) {
//       throw new ApiError(404, "Requested batch does not exist");
//     }

//     const batchObjectId = requestedBatch._id;

//     const isStatusAcceptable = productItemAcceptableStatus.some(
//       (eachStatus) =>
//         typeof eachStatus === "string" &&
//         sanitizedStatus === eachStatus.toLowerCase()
//     );
//     if (!isStatusAcceptable) {
//       throw new ApiError(406, "Product status unacceptable");
//     }

//     let parsedAttributes;
//     try {
//       parsedAttributes = JSON.parse(productAttributes);
//     } catch (err) {
//       throw new ApiError(400, "Invalid product attributes format");
//     }

//     if (!Array.isArray(parsedAttributes) || parsedAttributes.length === 0) {
//       throw new ApiError(
//         400,
//         "Product attributes are required and must be an array"
//       );
//     }

//     parsedAttributes.forEach((attr) => {
//       if (!attr.attributeName || !attr.attributeValue) {
//         throw new ApiError(
//           400,
//           "Each product attribute must have an attributeName and attributeValue"
//         );
//       }
//     });

//     const wouldBeSlug = slugify(productName.toLowerCase());
//     const existingSortedSimilarSlugs = await ProductItemModel.aggregate(
//       slugSortingQuery(wouldBeSlug)
//     );
//     const uniqueSlug = await generateUniqueSlug(
//       existingSortedSimilarSlugs,
//       wouldBeSlug
//     );

//     const productImages =
//       req.files?.map((file) => file.secure_url || file.path) || [];

//     // Step 1: Create the product item without the QR code
//     const createdProductItem = await ProductItemModel.create({
//       productName,
//       productType: {
//         _id: requestedProductType._id,
//         name: requestedProductType.name,
//       },
//       productPrice,
//       productSku,
//       productDescription,
//       productStatus: sanitizedStatus,
//       productManufacturer: {
//         _id: requestedManufacturer._id,
//         companyName: requestedManufacturer.companyName,
//       },
//       productAttributes: parsedAttributes,
//       slug: uniqueSlug,
//       batchId: {
//         _id: requestedBatch._id, // Store the batch _id
//         batchId: requestedBatch.batchId, // Store the batchId
//       },
//       productImages,
//       productWebLink,
//     });

//     // Step 2: Generate the QR code using the product's _id
//     const FRONTEND_URL =
//       process.env.NODE_ENV === "DEV"
//         ? process.env.FRONTEND_URL_DEV
//         : process.env.FRONTEND_URL_PROD;
//     const qrFilePath = await generateQr(
//       `${FRONTEND_URL}/products/${createdProductItem._id}`
//     );
//     const response = await uploadFile(qrFilePath);

//     // Step 3: Update the product item with the QR code URL
//     createdProductItem.qrUrl = response.secure_url;
//     await createdProductItem.save();

//     return res
//       .status(201)
//       .json(
//         new ApiResponse(201, createdProductItem, "Product created successfully")
//       );
//   } catch (error) {
//     console.error("Error occurred while creating product:", error);
//     next(
//       new ApiError(
//         500,
//         error.message || "Something went wrong while creating the product"
//       )
//     );
//   }
// };

const createProductItem = async (req, res, next) => {
  const blockchainToken = req.blockChainToken;

  try {
    const productItemAcceptableStatus = acceptableStatus();
    if (
      !productItemAcceptableStatus ||
      !Array.isArray(productItemAcceptableStatus)
    ) {
      throw new ApiError(500, "Acceptable status array is invalid");
    }

    const userId = req.user?._id;
    if (!userId) {
      throw new ApiError(404, "Unauthorized request");
    }

    const {
      productName,
      productType, // Array of productType IDs
      productSku,
      productDescription: rawProductDescription,
      productPrice,
      batchId,
      productStatus,
      productAttributes,
      productWebLink,
    } = req.body;
    const productDescription =
      rawProductDescription?.replace(/<\/?[^>]+(>|$)/g, "").trim() || ""; // for removing <p> tag

    const existingProductWithSku = await ProductItemModel.findOne({
      productSku,
    });
    if (existingProductWithSku) {
      throw new ApiError(
        400,
        `A product with SKU "${productSku}" already exists. Please use a unique SKU.`
      );
    }

    const sanitizedStatus =
      productStatus?.toLowerCase().replace(/['"]+/g, "").trim() || "completed";
    if (!sanitizedStatus) {
      throw new ApiError(400, "Product status is required");
    }

    // Fetch product types
    const requestedProductTypes = await ProductTypeModel.find({
      _id: { $in: productType },
      status: process.env.PRODUCT_TYPE_STATUS_ENABLED,
    });
    if (!requestedProductTypes || requestedProductTypes.length === 0) {
      throw new ApiError(
        404,
        "One or more requested product types do not exist or are disabled"
      );
    }

    // Format product types for storage
    const formattedProductTypes = requestedProductTypes.map((type) => ({
      _id: type._id,
      name: type.name,
    }));

    // Fetch manufacturer
    const requestedManufacturer = await UserModel.findById(userId);
    if (!requestedManufacturer) {
      throw new ApiError(404, "Manufacturer not found");
    }

    // Validate batch ID
    if (!mongoose.Types.ObjectId.isValid(batchId)) {
      console.error("Batch ID is invalid:", batchId);
      throw new ApiError(
        400,
        `Invalid batch ID format: ${batchId}. A valid batch ID must be a 24-character hexadecimal string.`
      );
    }

    const requestedBatch = await BatchIdModal.findOne({ _id: batchId });
    if (!requestedBatch) {
      throw new ApiError(404, "Requested batch does not exist");
    }

    const batchObjectId = requestedBatch._id;

    const isStatusAcceptable = productItemAcceptableStatus.some(
      (eachStatus) =>
        typeof eachStatus === "string" &&
        sanitizedStatus === eachStatus.toLowerCase()
    );
    if (!isStatusAcceptable) {
      throw new ApiError(406, "Product status unacceptable");
    }

    // Parse product attributes
    let parsedAttributes;
    try {
      parsedAttributes = JSON.parse(productAttributes);
      console.log("parsing  attributesssss============", parsedAttributes);
    } catch (err) {
      throw new ApiError(400, "Invalid product attributes format");
    }

    if (!Array.isArray(parsedAttributes) || parsedAttributes.length === 0) {
      throw new ApiError(
        400,
        "Product attributes are required and must be an array"
      );
    }

    parsedAttributes.forEach((attr) => {
      if (!attr.attributeName || !attr.attributeValue) {
        throw new ApiError(
          400,
          "Each product attribute must have an attributeName and attributeValue"
        );
      }
    });

    // Generate unique slug
    const wouldBeSlug = slugify(productName.toLowerCase());
    const existingSortedSimilarSlugs = await ProductItemModel.aggregate(
      slugSortingQuery(wouldBeSlug)
    );
    const uniqueSlug = await generateUniqueSlug(
      existingSortedSimilarSlugs,
      wouldBeSlug
    );

    // Handle product images
    const productImages =
      req.files?.map((file) => file.secure_url || file.path) || [];

    // Step 1: Create the product item without the QR code
    const createdProductItem = await ProductItemModel.create({
      productName,
      productType: formattedProductTypes,
      productPrice,
      productSku,
      productDescription,
      productStatus: sanitizedStatus,
      productManufacturer: {
        _id: requestedManufacturer._id,
        companyName: requestedManufacturer.companyName,
      },
      productAttributes: parsedAttributes,
      slug: uniqueSlug,
      batchId: {
        _id: requestedBatch._id,
        batchId: requestedBatch.batchId,
      },
      productImages,
      productWebLink,
    });

    // Step 2: Generate the QR code
    const FRONTEND_URL =
      process.env.NODE_ENV === "DEV"
        ? process.env.FRONTEND_URL_DEV
        : process.env.FRONTEND_URL_PROD;
    const qrFilePath = await generateQr(
      `${FRONTEND_URL}/product/${createdProductItem._id}`
    );
    const response = await uploadFile(qrFilePath);

    // Step 3: Update the product item with the QR code URL
    createdProductItem.qrUrl = response.secure_url;
    await createdProductItem.save();
    const savedAttributes = createdProductItem.productAttributes.map(
      (attr) => ({
        attributeName: attr.attributeName,
        attributeValue: attr.attributeValue,
        _id: attr._id.toString(), // Use database-generated _id
      })
    );
    // Step 4: Send data to the external blockchain API
    const externalApiUrl = `${process.env.BLOCKCHAIN_TEST_URL}/channels/mychannel/chaincodes/Productitem`;
    const payload = {
      fcn: "CreateProductItem",
      args: [
        createdProductItem._id.toString(),
        productName,
        productDescription,
        productPrice,
        productSku,
        JSON.stringify({
          _id: batchObjectId.toString(),
          batchId: requestedBatch.batchId,
        }),
        sanitizedStatus,
        JSON.stringify(
          formattedProductTypes.map((type) => ({
            _id: type._id.toString(),
            name: type.name,
          }))
        ),
        JSON.stringify({
          _id: requestedManufacturer._id.toString(),
          companyName: requestedManufacturer.companyName,
        }),
        JSON.stringify(savedAttributes),
        uniqueSlug,
        JSON.stringify(productImages),
        productWebLink,
        createdProductItem.createdAt.toISOString(),
        new Date().toISOString(),
        createdProductItem.qrUrl || null,
        "null", // Explicitly send `null`
        "false",
      ],
    };

    console.log("Payload to blockchain API:", JSON.stringify(payload, null, 2));

    const apiResponse = await axios.post(externalApiUrl, payload, {
      headers: {
        Authorization: `Bearer ${blockchainToken}`,
        "Content-Type": "application/json",
      },
    });

    // Final response to client
    return res
      .status(201)
      .json(
        new ApiResponse(201, createdProductItem, "Product created successfully")
      );
  } catch (error) {
    console.error("Error occurred while creating product:", error);
    next(
      new ApiError(
        500,
        error.message || "Something went wrong while creating the product"
      )
    );
  }
};

const updateProductItem = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      throw new ApiError(401, "unauthorized request");
    }

    const productId = req.body.id;
    if (!productId) {
      throw new ApiError(401, "product id not provided");
    }

    const {
      productName,
      productType,
      productSku,
      productDescription,
      productStatus,
      batchId,
      productWebLink,
    } = req.body;
    const fieldPassed = {
      productName,
      productType,
      productSku,
      productDescription,
      productStatus,
      batchId,
      productWebLink,
    };

    // status checker
    if (productStatus) {
      if (
        !acceptableStatus().some(
          (eachAccepatbleStatus) =>
            productStatus.toLowerCase() === eachAccepatbleStatus
        )
      ) {
        throw new ApiError(406, "product status unacceptable");
      }
    }

    const updatedProductItem = await ProductItemModel.findOneAndUpdate(
      { _id: productId },
      fieldPassed,
      {
        new: true,
        runValidators: true,
      }
    ).select("-__v");

    if (!updatedProductItem) {
      throw new ApiError(404, "product item not found");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedProductItem,
          "product item updated successfully"
        )
      );
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while getting products";
    }
    next(error);
  }
};

const deleteProductItem = async (req, res, next) => {
  try {
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while getting products";
    }
    next(error);
  }
};
const getProductById = async (req, res, next) => {
  // console.log("hitting to get single prod");
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Invalid product ID format"));
    }

    const product = await ProductItemModel.findById(id).select(
      "-__v -password -refreshToken"
    );
    if (!product) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "product not found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, product, "product details fetched successfully")
      );
  } catch (error) {
    console.error(error);
    if (!error.message) {
      error.message = "Something went wrong while fetching product details";
    }
    next(error);
  }
};

const editProductInfo = async (req, res, next) => {
  try {
    const blockChainToken = req.blockChainToken;

    const { productId } = req.params;
    const updateData = req.body;
    const productImages = req.files;
    const removedImages = JSON.parse(updateData.removedImages || "[]");

    const product = await ProductItemModel.findById(productId);
    if (!product) {
      return next(new ApiError(404, "Product not found"));
    }

    // Remove images that are flagged for removal
    if (removedImages.length > 0) {
      product.productImages = product.productImages.filter(
        (image) => !removedImages.includes(image)
      );
    }

    // If there are new images, append them to the existing array
    if (productImages && productImages.length > 0) {
      const newImagePaths = productImages.map((file) => file.path); // Get paths of the uploaded files
      product.productImages = [...product.productImages, ...newImagePaths];
    }

    // Parse productAttributes if it is a string (due to FormData)
    let parsedAttributes = [];
    if (typeof updateData.productAttributes === "string") {
      parsedAttributes = JSON.parse(updateData.productAttributes);
    } else if (Array.isArray(updateData.productAttributes)) {
      parsedAttributes = updateData.productAttributes;
    }

    const updatedAttributes = product.productAttributes.map((attr) => {
      const updatedAttr = parsedAttributes.find(
        (a) => a.attributeName === attr.attributeName
      );
      return updatedAttr ? updatedAttr : attr; // Use updated attribute or retain the existing one
    });

    parsedAttributes.forEach((newAttr) => {
      const exists = updatedAttributes.find(
        (attr) => attr.attributeName === newAttr.attributeName
      );
      if (!exists) {
        updatedAttributes.push(newAttr);
      }
    });

    Object.assign(product, {
      ...updateData,
      productAttributes: updatedAttributes,
    });
    const updatedProduct = await product.save();

    const args = [
      updatedProduct._id,
      updatedProduct.productName,
      updatedProduct.productDescription,
      updatedProduct.productPrice,
      updatedProduct.productSku,
      JSON.stringify(updatedProduct.batchId),
      updatedProduct.productStatus,
      JSON.stringify(updatedProduct.productType),
      JSON.stringify(updatedProduct.productManufacturer),
      JSON.stringify(updatedProduct.productAttributes),
      updatedProduct.slug,
      JSON.stringify(updatedProduct.productImages),
      updatedProduct.productWebLink,
    ];

    // Call friend's API
    const apiPayload = {
      fcn: "EditProductItem",
      args,
    };

    const apiResponse = await axios.post(
      "http://192.168.1.97:4000/channels/mychannel/chaincodes/Productitem",
      apiPayload,
      {
        headers: {
          Authorization: `Bearer ${blockChainToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedProduct,
          "Product info updated successfully"
        )
      );
  } catch (error) {
    console.error("Error updating product:", error);
    if (!error.message) {
      error.message = "Something went wrong while updating product info";
    }
    next(error);
  }
};

// const getCompanyProductItems = async (req, res, next) => {
//   try {
//     const companyId = req.params.companyId;
//     const userId = req.user?._id;
//     const userType = req.user?.userType;
//     const isSuperAdmin = userType === process.env.USER_TYPE_SUPER_ADMIN;
//     const isRetailer = userType === process.env.USER_TYPE_RETAILER;

//     if (!companyId) {
//       throw new ApiError(400, "Company ID is required");
//     }

//     let filter = {
//       productManufacturer: companyId, // Match by company ID
//     };

//     // If the user is a retailer, apply a more specific filter
//     if (isRetailer) {
//       filter.$or = [
//         { soldBy: userId }, // Products sold by the logged-in retailer
//         { productStatus: "pending" }, // Products that are unsold (status pending)
//       ];
//     }

//     // Fetch products based on the filter
//     const productItems = await ProductItemModel.find(filter)
//       .populate("productManufacturer", "companyName")
//       .populate("productType", "name")
//       .populate("batchId", "batchId")
//       .select("-__v");

//     return res
//       .status(200)
//       .json(
//         new ApiResponse(200, productItems, "Product items fetched successfully")
//       );
//   } catch (error) {
//     console.error(
//       "Error fetching product items:",
//       error.message || "unknown error"
//     );
//     next(error);
//   }
// };

// const getCompanyProductItems = async (req, res, next) => {
//   try {
//     const { page = 1, limit = 10, batchIdSearch } = req.query;
//     const companyId = req.params.companyId;
//     const userId = req.user?._id;
//     const userType = req.user?.userType;
//     const isRetailer = userType === process.env.USER_TYPE_RETAILER;

//     if (!companyId) {
//       throw new ApiError(400, "Company ID is required");
//     }

//     const options = {
//       page: parseInt(page, 10),
//       limit: parseInt(limit, 10),
//     };

//     // Base filter for productManufacturer
//     let filter = {
//       "productManufacturer._id": companyId, // Explicitly match the _id field
//     };

//     // Apply retailer-specific filter
//     if (isRetailer) {
//       filter.$or = [
//         { soldBy: userId }, // Products sold by the logged-in retailer
//         { purchasedStatus: false }, // Products whose purchasedStatus is false
//       ];
//     }

//     // Add batchIdSearch filter if provided
//     if (batchIdSearch) {
//       filter["batchId.batchId"] = { $regex: batchIdSearch, $options: "i" };
//     }

//     // Fetch total count of items matching the filter
//     const totalItems = await ProductItemModel.countDocuments(filter);

//     // Fetch products with pagination
//     const productItems = await ProductItemModel.find(filter)
//       .populate("productManufacturer", "companyName")
//       .populate("productType", "name")
//       .populate("batchId", "batchId") // Ensure correct field is populated
//       .select("-__v")
//       .skip((options.page - 1) * options.limit)
//       .limit(options.limit);

//     return res.status(200).json({
//       statusCode: 200,
//       data: {
//         productItems,
//         pagination: {
//           totalItems,
//           totalPages: Math.ceil(totalItems / options.limit),
//           currentPage: options.page,
//         },
//       },
//       message: "Product items fetched successfully",
//     });
//   } catch (error) {
//     console.error(
//       "Error fetching product items:",
//       error.message || "unknown error"
//     );
//     next(error);
//   }
// };
const getCompanyProductItems = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, batchIdSearch } = req.query;
    const companyId = req.params.companyId;
    const userId = req.user?._id;
    const userType = req.user?.userType;
    const isRetailer = userType === process.env.USER_TYPE_RETAILER;

    if (!companyId) {
      throw new ApiError(400, "Company ID is required");
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      skip: (parseInt(page, 10) - 1) * parseInt(limit, 10),
    };

    // Base filter for productManufacturer
    let filter = {
      "productManufacturer._id": companyId, // Explicitly match the _id field
    };

    // Apply retailer-specific filter
    if (isRetailer) {
      filter.$or = [
        { soldBy: userId }, // Products sold by the logged-in retailer
        { purchasedStatus: false }, // Products whose purchasedStatus is false
      ];
    }

    // Add batchIdSearch filter if provided
    if (batchIdSearch) {
      filter["batchId.batchId"] = { $regex: batchIdSearch, $options: "i" };
    }

    // Fetch total count of items matching the filter
    const totalItems = await ProductItemModel.countDocuments(filter);

    // Fetch products with pagination
    const productItems = await ProductItemModel.find(filter)
      .populate("productManufacturer", "companyName")
      .populate("productType", "name")
      .populate("batchId", "batchId")
      .select(
        "productName productDescription productPrice productSku productStatus productAttributes productImages slug productWebLink createdAt updatedAt qrUrl batchId productManufacturer productType soldBy purchasedStatus"
      )
      .skip(options.skip)
      .limit(options.limit);

    if (!productItems || productItems.length === 0) {
      throw new ApiError(404, "No product items found");
    }

    // Hash the fetched product items
    const hashedProducts = productItems.map((product) => {
      const productData = {
        id: product._id.toString(),
        productName: product.productName,
        productDescription: product.productDescription,
        productPrice: product.productPrice,
        productSku: product.productSku,
        batchId: product.batchId
          ? {
              _id: product.batchId._id.toString(),
              batchId: product.batchId.batchId,
            }
          : null,
        productStatus: product.productStatus,
        productType: product.productType.map((type) => ({
          _id: type._id.toString(),
          name: type.name,
        })),
        productManufacturer: product.productManufacturer
          ? {
              _id: product.productManufacturer._id.toString(),
              companyName: product.productManufacturer.companyName,
            }
          : null,
        productAttributes: product.productAttributes.map((attr) => ({
          attributeName: attr.attributeName,
          attributeValue: attr.attributeValue,
          _id: attr._id.toString(),
        })),
        slug: product.slug,
        productImages: product.productImages,
        productWebLink: product.productWebLink,
        qrUrl: product.qrUrl,
        createdAt: product.createdAt.toISOString(),
        soldBy: product.soldBy,
        purchasedStatus: product.purchasedStatus,
      };

      const productString = JSON.stringify(productData);
      const hash = crypto
        .createHash("sha256")
        .update(productString)
        .digest("hex");

      return {
        ...productData,
        hash,
      };
    });

    // Prepare product IDs for external API request
    const productIdList = hashedProducts.map((product) => product.id);

    // Fetch data from external API
    let externalApiResponse = [];
    try {
      const payload = {
        fcn: "GetProductWithHash",
        args: productIdList,
      };

      const blockchainToken = req.blockChainToken;
      if (!blockchainToken) {
        throw new ApiError(401, "Blockchain authorization token not found");
      }

      const response = await axios.post(
        `${process.env.BLOCKCHAIN_TEST_URL}/channels/mychannel/chaincodes/Productitem`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${blockchainToken}`,
          },
        }
      );

      if (
        response.data &&
        response.data.result &&
        Array.isArray(response.data.result.result)
      ) {
        externalApiResponse = response.data.result.result;
      } else {
        console.error(
          "Unexpected external API response format:",
          response.data
        );
      }
    } catch (error) {
      console.error("Error fetching external API data:", error.message);
    }

    // Compare hashes
    const comparisonResults = hashedProducts.map((product) => {
      const apiProduct = externalApiResponse.find(
        (apiData) => apiData.ProductId === product.id
      );

      if (apiProduct) {
        const blockChainVerified =
          apiProduct.blockHash === product.hash ? true : "unverified";

        return {
          ...product,
          blockChainVerified,
        };
      } else {
        return {
          ...product,
          blockChainVerified: false,
        };
      }
    });

    // Response
    return res.status(200).json({
      statusCode: 200,
      data: {
        productItems: comparisonResults,
        pagination: {
          totalItems,
          totalPages: Math.ceil(totalItems / options.limit),
          currentPage: options.page,
        },
      },
      message: "Product items fetched successfully",
    });
  } catch (error) {
    console.error(
      "Error fetching product items:",
      error.message || "unknown error"
    );
    next(error);
  }
};

export {
  getProductItems,
  getCompanyProductItems,
  getSingleProduct,
  createProductItem,
  updateProductItem,
  deleteProductItem,
  getProductById,
  editProductInfo,
  getSingleProductOnSlug,
};
