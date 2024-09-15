import React from "react"

export default function Pagination({ numberOfDataPerPage = 10, totalNumberOfData, currentPage = 1 }) {
  const totalPages = Math.ceil(totalNumberOfData / numberOfDataPerPage)
  const pageNumbers = Array.from({ length: totalPages }, (_, idx) => idx + 1)

  return (
    <>
      Page{" "}
      {
        <select
          className="rounded-sm border-2 border-black outline-none"
          defaultValue={currentPage}
        >
          {pageNumbers.map((pageNumber, idx) => (
            <option
              key={idx}
              value={pageNumber}
            >
              {pageNumber}
            </option>
          ))}
        </select>
      }{" "}
      of {totalPages}
    </>
  )
}
