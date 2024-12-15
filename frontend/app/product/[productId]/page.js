"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useSwipeable } from "react-swipeable"
import ImgWithWrapper from "@/components/composites/img-with-wrapper"

const Page = () => {
  const params = useParams()
  const [productData, setProductData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const handlePrevImage = () => {
    if (productData?.productImages?.length > 0) {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex - 1 + productData.productImages.length) % productData.productImages.length,
      )
    }
  }

  const handleNextImage = () => {
    if (productData?.productImages?.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % productData.productImages.length)
    }
  }

  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleNextImage,
    onSwipedRight: handlePrevImage,
    preventDefaultTouchmoveEvent: true,
    trackTouch: true,
    trackMouse: false,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL_DEV}/products/${params.productId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch product data")
        }
        const data = await response.json()
        setProductData(data.data?.productItem)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.productId])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  const productImages = productData?.productImages || []
  const currentImage =
    productImages.length > 0 && productImages[currentImageIndex]
      ? `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/${productImages[currentImageIndex].replace(/\\/g, "/")}`
      : null

  return (
    <div className="px-4 pt-14 md:px-8 lg:px-16">
      <div className="left-4 top-4 z-10 mb-4 flex justify-center">
        <ImgWithWrapper
          wrapperClassName="size-20"
          imageClassName="object-contain"
          imageAttributes={{
            src:
              productData?.blockChainVerified === false
                ? "/assets/Unverified.png"
                : productData?.blockChainVerified === true
                  ? "/assets/Verified2.png"
                  : "/assets/pending.png",
            alt:
              productData?.blockChainVerified === false
                ? "Unverified Logo"
                : productData?.blockChainVerified === true
                  ? "Verified Logo"
                  : "Pending Logo",
          }}
        />
      </div>
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-8 lg:space-y-0">
        <div className="lg:w-1/2">
          {productImages.length > 0 && (
            <div
              className="relative flex items-center justify-center space-x-4"
              {...swipeHandlers} // Attach swipe handlers here
            >
              {/* Blockchain Verified Icon */}

              {/* Image Navigation */}
              <button
                onClick={handlePrevImage}
                className="z-10 rounded-full bg-gray-300 p-2 hover:bg-gray-400"
              >
                &#8592;
              </button>

              <img
                src={currentImage}
                alt={`Product image ${currentImageIndex + 1}`}
                className="h-[300px] w-3/4 rounded-md object-cover md:h-[400px] lg:h-[500px]"
              />

              <button
                onClick={handleNextImage}
                className="z-10 rounded-full bg-gray-300 p-2 hover:bg-gray-400"
              >
                &#8594;
              </button>
            </div>
          )}
        </div>
        <div className="lg:w-1/2">
          <div className="my-5">
            <p className="mt-4 text-base font-bold"> Batch Id: {productData?.batchId?.batchId || "N/A"}</p>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-[#02235E] md:text-4xl lg:text-5xl">{productData?.productName}</h1>
            </div>

            <p className="mt-4 text-base font-bold">Product SKU: {productData?.productSku}</p>
          </div>
          <div className="my-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-white px-4 py-4">
              <p className="font-bold">
                Price: <span className="font-normal">${productData?.productPrice}</span>
              </p>
            </div>
            <div className="rounded-lg bg-white px-4 py-4">
              <p className="font-bold">
                Product Type:{" "}
                <span className="font-normal">
                  {productData?.productType?.map((type) => type.name).join(", ") || "N/A"}
                </span>
              </p>
            </div>
          </div>
          <div className="my-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-white px-4 py-4">
              <p className="font-bold">
                Product Status: <span className="font-normal">{productData?.productStatus}</span>
              </p>
            </div>
            <div className="rounded-lg bg-white px-4 py-4">
              <p className="font-bold">
                Manufacturer: <span className="font-normal">{productData?.productManufacturer?.companyName}</span>
              </p>
            </div>
          </div>
          <div className="rounded-lg bg-white px-4 py-4">
            <p className="font-bold">Product Weblink</p>
            {productData?.productWebLink ? (
              <a
                href={productData.productWebLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {productData.productWebLink}
              </a>
            ) : (
              <p className="text-[#7f7f7f]">N/A</p>
            )}
          </div>
        </div>
      </div>

      <div className="my-2 rounded-lg bg-white px-4 py-4">
        <p className="text-lg font-bold">Detailed Description</p>
        <p
          className="text-black"
          dangerouslySetInnerHTML={{ __html: productData?.productDescription }}
        ></p>
      </div>

      <div className="my-2 mt-4 rounded-lg bg-white px-4 py-4">
        <p className="text-lg font-bold">Product Attributes</p>
        {productData?.productAttributes.map((eachAttribute) => (
          <div
            className="flex flex-wrap gap-4"
            key={eachAttribute._id}
          >
            <p className="w-full font-bold md:w-52">{eachAttribute.attributeName}</p>
            <p className="text-sm text-[#7f7f7f]">{eachAttribute.attributeValue}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Page
