"use client"

import { faUser } from "@fortawesome/free-regular-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import React from "react"
import { useRouter } from "next/navigation"
import InputWithIcon from "@/components/composites/input-with-icon"
import Button from "../elements/button"
import ImgWithWrapper from "../composites/img-with-wrapper"
import { loginEmailRule, loginPasswordRule } from "@/utils/validation"
import { useLoginFormContext } from "@/contexts/login-form-context"
import { signInUser } from "@/contexts/query-provider/api-request-functions/api-requests"
import { useMutation } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { useState } from "react"

export default function LoginTemplate() {
  const router = useRouter()
  const { register, handleSubmit } = useLoginFormContext()
  const [isPasswordVisible, setPasswordVisible] = useState(false)

  const loginMutation = useMutation({
    mutationFn: (data) => signInUser(data),
    onSuccess: (data) => {
      toast.success(data.message)
      router.push("/")
      return
    },
    onError: (error) => toast.error(error.data.message),
  })

  const submitFn = (formData) => {
    loginMutation.mutate({
      email: formData.loginEmail,
      password: formData.loginPassword,
    })
  }

  const togglePasswordVisibility = () => {
    setPasswordVisible(!isPasswordVisible)
  }
  return (
    <div className="flex h-screen w-screen bg-gray-100">
      {/* Main content of the login page */}

      {/* Image Section on the left */}
      <div className="h-full w-0 bg-[url('/assets/loginimage.png')] bg-cover bg-bottom bg-no-repeat md:w-[30%]"></div>

      {/* Form Section on the right */}
      <div className="flex min-h-screen w-full items-center justify-center border-2 md:w-[70%]">
        <div className="flex w-[min(1000px,110%)] rounded-lg">
          <div className="w-full space-y-6 p-10">
            {/* Logo placed above the title */}
            <ImgWithWrapper
              wrapperClassName="mx-auto w-[200px] h-[60px]"
              imageAttributes={{ src: "/assets/authprodlogo.png", alt: "logo" }}
            />

            {/* Title */}
            <div className="text-center">
              <h1 className="text-xl font-bold text-[#02235E]">Login to your account</h1>
              <p className="mb-10 text-sm">Welcome back, You've been missed!</p>
            </div>

            {/* Email Input */}
            <div className="mx-auto w-full max-w-[350px]">
              <InputWithIcon
                iconElement={
                  <FontAwesomeIcon
                    icon={faUser}
                    className="fa-fw ml-2 text-gray-400"
                  />
                }
                useFormContext={useLoginFormContext}
                wrapperClassName="bg-white border border-gray-300 rounded-lg"
                inputAttributes={{
                  type: "email",
                  placeholder: "example@mail.com",
                  name: "loginEmail",
                  register,
                  fieldRule: loginEmailRule,
                  className: "placeholder:text-xs ",
                }}
              />
            </div>

            {/* Password Input with Forgot Password link */}
            <div className="relative mx-auto w-full max-w-[350px]">
              <InputWithIcon
                iconElement={
                  <svg
                    className="ml-2 inline h-5 w-5 text-gray-400"
                    fill="#000000"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 485.017 485.017"
                  >
                    <g>
                      <path
                        d="M361.205,68.899c-14.663,0-28.447,5.71-38.816,16.078c-21.402,21.403-21.402,56.228,0,77.631
                          c10.368,10.368,24.153,16.078,38.815,16.078s28.447-5.71,38.816-16.078c21.402-21.403,21.402-56.228,0-77.631
                          C389.652,74.609,375.867,68.899,361.205,68.899z M378.807,141.394c-4.702,4.702-10.953,7.292-17.603,7.292
                          s-12.901-2.59-17.603-7.291c-9.706-9.706-9.706-25.499,0-35.205c4.702-4.702,10.953-7.291,17.603-7.291s12.9,2.589,17.603,7.291
                          C388.513,115.896,388.513,131.688,378.807,141.394z"
                      />
                      <path
                        d="M441.961,43.036C414.21,15.284,377.311,0,338.064,0c-39.248,0-76.146,15.284-103.897,43.036
                          c-42.226,42.226-54.491,105.179-32.065,159.698L0.254,404.584l-0.165,80.268l144.562,0.165v-55.722h55.705l0-55.705h55.705v-64.492
                          l26.212-26.212c17.615,7.203,36.698,10.976,55.799,10.976c39.244,0,76.14-15.282,103.889-43.032
                          C499.25,193.541,499.25,100.325,441.961,43.036z M420.748,229.617c-22.083,22.083-51.445,34.245-82.676,34.245
                          c-18.133,0-36.237-4.265-52.353-12.333l-9.672-4.842l-49.986,49.985v46.918h-55.705l0,55.705h-55.705v55.688l-84.5-0.096
                          l0.078-37.85L238.311,208.95l-4.842-9.672c-22.572-45.087-13.767-99.351,21.911-135.029C277.466,42.163,306.83,30,338.064,30
                          c31.234,0,60.598,12.163,82.684,34.249C466.34,109.841,466.34,184.025,420.748,229.617z"
                      />
                    </g>
                  </svg>
                }
                useFormContext={useLoginFormContext}
                wrapperClassName="bg-white border border-gray-300 rounded-lg"
                inputAttributes={{
                  type: isPasswordVisible ? "text" : "password",
                  placeholder: "password",
                  name: "loginPassword",
                  register,
                  fieldRule: loginPasswordRule,
                  className: "placeholder:text-xs",
                }}
              />
              <Button
                className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-600"
                onClick={togglePasswordVisibility}
              >
                {isPasswordVisible ? "👁️" : "🙈"}
              </Button>

              {/* Forgot Password link positioned below the password field */}
              <div className="absolute bottom-[-1.5rem] right-0">
                <Button
                  className="p-0 text-xs text-[#02235E] hover:[#012D61]"
                  onClick={() => router.push("/forgetPassword")}
                >
                  Forgot Password?
                </Button>
              </div>
            </div>

            {/* Login Button */}
            <div className="mt-8 text-center">
              <Button
                className={`w-full max-w-[350px] mt-3 rounded-lg bg-[#02235E] px-8 py-2 text-white ${
                  loginMutation.isPending ? "cursor-not-allowed opacity-50" : "opacity-100"
                } hover:bg-[#012D61]`}
                onClick={handleSubmit(submitFn)}  
                disabled={loginMutation.isPending}
              >
                <span className="flex items-center justify-center">
                  {loginMutation.isPending ? (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-gray-400" />
                  ) : (
                    "Login"
                  )}
                </span>
              </Button>
            </div>

            <div className="mt-4 text-center">
              <Button
                className="p-0 text-xs text-black hover:text-black"
                onClick={() => router.push("/register")}
              >
                <span className="text-black">Don't have an account? </span>
                <span className="text-[#02235E] hover:[#012D61]">Register</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
    // </div>
  )
}
