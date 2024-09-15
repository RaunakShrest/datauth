"use client"

import React, { useEffect } from "react"
import ImgWithWrapper from "../composites/img-with-wrapper"
import InputWithIcon from "../composites/input-with-icon"
import InputGroupWithLabel from "../blocks/input-group-with-label"
import { userTypeOptions } from "@/utils/staticUtils"
import Button from "../elements/button"
import {
  addressLineRule,
  cityRule,
  companyNameRule,
  countryRule,
  firstNameRule,
  lastNameRule,
  middleNameRule,
  phoneRule,
  productTypeRule,
  registerEmailRule,
  registrationConfirmPasswordRule,
  registrationPasswordRule,
  userTypeRule,
  zipRule,
} from "@/utils/validation"
import { useRegisterFormContext } from "@/contexts/register-form-context"
import { useMutation } from "@tanstack/react-query"
import { registerUser } from "@/contexts/query-provider/api-request-functions/api-requests"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

export default function RegisterTemplate() {
  const router = useRouter()

  const { register, handleSubmit, control, watch, setError, clearErrors } = useRegisterFormContext()

  // protects from re-renders still providing real time data
  /* useEffect(() => {
    const subscription = watch((data) => {
      if (data.registerPassword !== data.confirmRegisterPassword) {
        setError("registerPassword", { type: "custom", message: "passwords do not match" })
        setError("confirmRegisterPassword", { type: "custom", message: "passwords do not match" })
      } else {
        clearErrors(["registerPassword", "confirmRegisterPassword"])
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [watch]) */

  const registerMutation = useMutation({
    mutationFn: (data) => registerUser(data),
    onSuccess: (response) => {
      toast.success(
        <>
          <span>{response.message}</span> <br />
          <span>Please Login</span>
        </>,
      )

      router.push("/login")
    },
    onError: (error) =>
      toast.error(
        <>
          <span>{error.data.message}</span> <br />
          <span>Please try again</span>
        </>,
      ),
  })

  const submitFn = (formData) => {
    const dataToPost = {
      ...formData,
      password: formData.registerPassword,
      email: formData.registerEmail,
      phoneNumber: formData.phone,
      address: {
        zip: formData.zip,
        city: formData.city,
        country: formData.country,
        addressLine: formData.addressLine,
      },
    }

    return registerMutation.mutate(dataToPost)
  }

  return (
    <div>
      <div className="container">
        <div className="grid grid-cols-12 border-2 border-[#007082]">
          <div className="-z-10 col-start-1 col-end-7 bg-[#007082]">
            <ImgWithWrapper
              imageAttributes={{ src: "/assets/lady-with-computer.png", alt: "logo" }}
              imageClassName="object-top"
              wrapperClassName="h-full -mr-16"
            />
          </div>

          <div className="col-start-7 -col-end-1">
            <div className="mb-16">
              <ImgWithWrapper
                wrapperClassName="mx-auto size-[200px]"
                imageAttributes={{ src: "/assets/logo_satyata.png", alt: "logo" }}
              />

              <h1 className="text-center text-4xl font-bold">Registration</h1>
            </div>

            <div className="space-y-8 py-4">
              {/* Full Name Input Group */}

              <InputGroupWithLabel
                cols={3}
                label="Full Name"
                requiredField
              >
                <InputWithIcon
                  useFormContext={useRegisterFormContext}
                  iconElement={false}
                  inputAttributes={{
                    type: "text",
                    placeholder: "First Name",
                    required: true,
                    name: "firstName",
                    register,
                    fieldRule: firstNameRule,
                  }}
                />

                <InputWithIcon
                  useFormContext={useRegisterFormContext}
                  iconElement={false}
                  inputAttributes={{
                    type: "text",
                    placeholder: "Middle Name",
                    name: "middleName",
                    register,
                    fieldRule: middleNameRule,
                  }}
                />

                <InputWithIcon
                  useFormContext={useRegisterFormContext}
                  iconElement={false}
                  inputAttributes={{
                    type: "text",
                    placeholder: "Last Name",
                    required: true,
                    name: "lastName",
                    register,
                    fieldRule: lastNameRule,
                  }}
                />
              </InputGroupWithLabel>

              {/* Address Input Group */}
              <InputGroupWithLabel
                cols={3}
                label="Address"
                requiredField
              >
                <InputWithIcon
                  useFormContext={useRegisterFormContext}
                  iconElement={false}
                  takesFullWidth
                  inputAttributes={{
                    type: "text",
                    placeholder: "Address Line",
                    required: true,
                    name: "addressLine",
                    register,
                    fieldRule: addressLineRule,
                  }}
                />

                <InputWithIcon
                  useFormContext={useRegisterFormContext}
                  iconElement={false}
                  inputAttributes={{
                    type: "text",
                    placeholder: "Country",
                    required: true,
                    name: "country",
                    register,
                    fieldRule: countryRule,
                  }}
                />

                <InputWithIcon
                  useFormContext={useRegisterFormContext}
                  iconElement={false}
                  inputAttributes={{
                    type: "text",
                    placeholder: "City/State",
                    required: true,
                    name: "city",
                    register,
                    fieldRule: cityRule,
                  }}
                />

                <InputWithIcon
                  useFormContext={useRegisterFormContext}
                  iconElement={false}
                  inputAttributes={{
                    type: "text",
                    placeholder: "Zip Code",
                    required: true,
                    name: "zip",
                    register,
                    fieldRule: zipRule,
                  }}
                />
              </InputGroupWithLabel>

              <div className="grid grid-cols-2 gap-4 rounded-lg px-4">
                <InputWithIcon
                  useFormContext={useRegisterFormContext}
                  iconElement={false}
                  inputAttributes={{
                    type: "email",
                    required: true,
                    placeholder: "example@mail.com",
                    name: "registerEmail",
                    register,
                    fieldRule: registerEmailRule,
                  }}
                  label="Email"
                />

                <InputWithIcon
                  useFormContext={useRegisterFormContext}
                  iconElement={false}
                  inputAttributes={{
                    type: "text",
                    required: true,
                    placeholder: "+977 9812345678",
                    name: "phone",
                    register,
                    fieldRule: phoneRule,
                  }}
                  label="Phone"
                />
              </div>

              <div className="rounded-lg px-4">
                <InputWithIcon
                  useFormContext={useRegisterFormContext}
                  iconElement={false}
                  inputAttributes={{
                    type: "text",
                    required: true,
                    placeholder: "Company Name",
                    name: "companyName",
                    register,
                    fieldRule: companyNameRule,
                  }}
                  label="Company Name"
                />
              </div>

              <div className="rounded-lg px-4">
                <InputWithIcon
                  useFormContext={useRegisterFormContext}
                  iconElement={false}
                  inputAttributes={{
                    type: "select",
                    options: userTypeOptions,
                    required: true,
                    placeholder: "User Type",
                    name: "userType",
                    register,
                    fieldRule: userTypeRule,
                  }}
                  label="User Type"
                />
              </div>

              <div className="rounded-lg px-4">
                <InputWithIcon
                  useFormContext={useRegisterFormContext}
                  iconElement={false}
                  inputAttributes={{
                    type: "text",
                    required: true,
                    placeholder: "Product Type",
                    name: "productType",
                    register,
                    fieldRule: productTypeRule,
                  }}
                  label="Product Type"
                />
              </div>

              {/* Password Input Group */}
              <InputGroupWithLabel
                cols={2}
                label="Password"
                requiredField
              >
                <InputWithIcon
                  useFormContext={useRegisterFormContext}
                  iconElement={false}
                  inputAttributes={{
                    type: "password",
                    required: true,
                    placeholder: "Password",
                    name: "registerPassword",
                    register,
                    fieldRule: {
                      ...registrationPasswordRule,
                      validate: (value) => {
                        if (watch("confirmRegisterPassword") !== value) {
                          setError("confirmRegisterPassword", { type: "custom", message: "passwords do not match" })

                          return "passwords do not match"
                        }

                        clearErrors(["registerPassword", "confirmRegisterPassword"])
                        return true
                      },
                    },
                  }}
                />

                <InputWithIcon
                  useFormContext={useRegisterFormContext}
                  iconElement={false}
                  inputAttributes={{
                    type: "password",
                    required: true,
                    placeholder: "Confirm Password",
                    name: "confirmRegisterPassword",
                    register,
                    fieldRule: {
                      ...registrationConfirmPasswordRule,
                      validate: (value) => {
                        if (watch("registerPassword") !== value) {
                          setError("registerPassword", { type: "custom", message: "passwords do not match" })

                          return "passwords do not match"
                        }

                        clearErrors(["registerPassword", "confirmRegisterPassword"])
                        return true
                      },
                    },
                  }}
                />
              </InputGroupWithLabel>

              <div className="px-4 text-right">
                <Button
                  type="submit"
                  className="bg-[#017082] px-8 py-2 text-white"
                  onClick={handleSubmit(submitFn)}
                  disabled={registerMutation.isPending}
                >
                  <span className="flex h-6 w-16 items-center justify-center">
                    {registerMutation.isPending ? (
                      <span className="inline-block size-4 animate-spin rounded-full border-2 border-white border-t-gray-400" />
                    ) : (
                      <span>Submit</span>
                    )}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
