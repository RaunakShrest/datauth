import React, { useRef } from "react";
import Table from "./table";
import { twMerge } from "tailwind-merge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { useCompanies } from "@/contexts/companies-context";
import Pagination from "../composites/pagination";
import Checkbox from "../elements/checkbox";
import ContextMenu from "./context-menu";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function DataTable() {
  const router = useRouter();
  const tableRef = useRef();
  const contextMenuRef = useRef();

  const { data, sortData, selectedData, setSelectedData, fetchCompanies } = useCompanies(); // Added fetchData

  const isTableDataSelected = (dataToVerify) => {
    return selectedData.some((eachSelected) => eachSelected.companyName === dataToVerify.companyName);
  };

  const isTableHeadingSelected = () => {
    return data.data?.every((datum) =>
      selectedData.some((eachSelected) => eachSelected.companyName === datum.companyName),
    );
  };

  const handleTableHeadingCheckboxChange = () => {
    setSelectedData((prev) =>
      prev.length > 0 ? (prev.length < data.data.length ? [...data.data] : []) : [...data.data],
    );
  };

  const handleTableDataCheckboxChange = (clickedData) => {
    setSelectedData((prev) =>
      isTableDataSelected(clickedData)
        ? prev.filter((eachPrev) => eachPrev.companyName !== clickedData.companyName)
        : [...prev, clickedData],
    );
  };

  const handleApprove = async (company) => {
    const updatedCompany = { ...company, status: 'verified' };

    try {
      await updateCompanyStatus(company._id, updatedCompany);  // Use _id instead of id
      await fetchCompanies();
    } catch (error) {
      console.error("Failed to approve company:", error);
    }
  };

  const updateCompanyStatus = async (id, updatedCompany) => {
    try {
      const response = await axios.patch( `${process.env.NEXT_PUBLIC_BASE_URL_DEV}/users/get-companies/${id}`,updatedCompany, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error updating company status:", error.response?.data || error.message);
      throw new Error('Failed to update company status');
    }
  };
 const handleDelete = async (companyId) => {
    if (window.confirm("Are you sure you want to delete this company?")) {
      try {
        await deleteCompany(companyId);
        await fetchCompanies();  
      } catch (error) {
        console.error("Failed to delete company:", error);
      }
    }
  };

  const deleteCompany = async (id) => {
    try {
      const response = await axios.delete(`${process.env.NEXT_PUBLIC_BASE_URL_DEV}/users/delete-company/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting company:", error.response?.data || error.message);
      throw new Error('Failed to delete company');
    }
  };
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table className="w-full table-fixed border-collapse" tableRef={tableRef}>
          <Table.Head className="bg-[#017082] text-left text-white">
            <Table.Row className="h-16">
              <Table.Heading className="pl-4" style={{ width: "50px" }}>
                <Checkbox
                  onChange={handleTableHeadingCheckboxChange}
                  checked={isTableHeadingSelected()}
                />
              </Table.Heading>
              {data.columns?.map((column) => (
                <Table.Heading
                  className={twMerge("px-2")}
                  key={column.id}
                  dataKey={column.dataKey}
                  isSortable={column.isSortable}
                  sortData={sortData}
                  style={{ width: column.width ?? "" }}
                >
                  {column.text}
                </Table.Heading>
              ))}
              <Table.Heading className="pl-4" style={{ width: "100px" }}>
                Action
              </Table.Heading>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {data.data?.map((datum, idx) => (
              <Table.Row key={idx} className={twMerge((idx + 1) % 2 !== 0 ? "bg-white" : "")}>
                <Table.Column className="px-4 py-2">
                  <Checkbox
                    onChange={() => handleTableDataCheckboxChange(datum)}
                    checked={isTableDataSelected(datum)}
                  />
                </Table.Column>
                <Table.Column className="px-2">{datum.companyName}</Table.Column>
                <Table.Column className="p-2">
                  <span className="line-clamp-1">{datum.firstName} {datum.lastName}</span>
                </Table.Column>
                <Table.Column className="overflow-hidden p-2">
                  <span className="line-clamp-1">{datum.phoneNumber}</span>
                </Table.Column>
                <Table.Column className="overflow-hidden p-2">
                  <span className="line-clamp-1">{datum.email}</span>
                </Table.Column>
                <Table.Column className="overflow-hidden p-2">
                  <span className="line-clamp-1">{datum.productType.join(', ')}</span>
                </Table.Column>
                <Table.Column className="p-2">{datum.status}</Table.Column>
                <Table.Column className="p-2">
                  <ContextMenu className="relative" tableRef={tableRef} contextMenuRef={contextMenuRef}>
                    <ContextMenu.Trigger>
                      <FontAwesomeIcon icon={faEllipsisVertical} className="fa-fw" />
                    </ContextMenu.Trigger>
                    <ContextMenu.Menu
                      className="absolute z-10 w-[175px] space-y-1 text-white"
                      contextMenuRef={contextMenuRef}
                    >
                      <ContextMenu.Item
                        className="rounded-md bg-[#017082]"
                        onClick={() => router.push("/companies/single-company")}
                      >
                        View
                      </ContextMenu.Item>
                      <ContextMenu.Item
                        className="rounded-md bg-[#017082]"
                        onClick={() => router.push("/companies/edit-company")}
                      >
                        Edit
                      </ContextMenu.Item>
                      <ContextMenu.Item
                        className="rounded-md bg-[#017082]"
                        onClick={() => handleDelete(datum._id)} 
                      >
                        Delete
                      </ContextMenu.Item>
                      <ContextMenu.Item
                        className="rounded-md bg-[#017082]"
                        onClick={() => handleApprove(datum)}  
                      >
                        Approve
                      </ContextMenu.Item>
                    </ContextMenu.Menu>
                  </ContextMenu>
                </Table.Column>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>
      <div className="text-right">
        <Pagination
          totalNumberOfData={260}
          numberOfDataPerPage={10}
          currentPage={8}
        />
      </div>
    </div>
  );
}
