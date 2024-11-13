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

export default function LoginTemplate() {
  const router = useRouter()
  const { register, handleSubmit } = useLoginFormContext()

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

  return (
    <div className="container">
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex min-h-[90vh] w-[min(800px,100%)] rounded-lg shadow-lg">
          <div className="w-1/2">
            <ImgWithWrapper
              wrapperClassName="relative h-full overflow-hidden rounded-l-lg"
              imageAttributes={{ src: "/assets/hand-image.png", alt: "login-hero-image" }}
            />
          </div>

          <div className="w-1/2 space-y-4 p-8">
            <div>
              <h1 className="text-center text-4xl font-bold">Login</h1>
            </div>

            <ImgWithWrapper
              wrapperClassName="mx-auto size-[200px]"
              imageAttributes={{ src: "/assets/logo_satyata.png", alt: "logo" }}
            />

            <InputWithIcon
              iconElement={
                <FontAwesomeIcon
                  icon={faUser}
                  className="fa-fw ml-2"
                />
              }
              useFormContext={useLoginFormContext}
              wrapperClassName="bg-white"
              inputAttributes={{
                type: "email",
                placeholder: "example@mail.com",
                name: "loginEmail",
                register,
                fieldRule: loginEmailRule,
              }}
            />

            <InputWithIcon
              iconElement={
                <svg
                  className="ml-2 inline h-4 w-4"
                  fill="#000000"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  // xmlns:xlink="http://www.w3.org/1999/xlink"
                  viewBox="0 0 485.017 485.017"
                  // xml:space="preserve"
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
              wrapperClassName="bg-white"
              inputAttributes={{
                type: "password",
                placeholder: "password",
                name: "loginPassword",
                register,
                fieldRule: loginPasswordRule,
              }}
            />

            <div className="flex justify-between">
              <Button
                className="p-0 text-sm text-[#8f8f8f]"
                onClick={() => router.push("/forgetPassword")}
              >
                Forgot Password ?
              </Button>

              <Button
                className="p-0 text-sm text-[#8f8f8f]"
                onClick={() => router.push("/register")}
              >
                Register
              </Button>
            </div>

            <div className="!mt-12 text-center">
              <Button
                className={`bg-[#017082] px-8 py-2 text-white ${loginMutation.isPending ? "opacity-50" : "opacity-100"}`}
                onClick={handleSubmit(submitFn)}
                disabled={loginMutation.isPending}
              >
                <span className="flex h-6 w-16 items-center justify-center">
                  {loginMutation.isPending ? (
                    <span className="inline-block size-4 animate-spin rounded-full border-2 border-white border-t-gray-400" />
                  ) : (
                    <span>Login</span>
                  )}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
