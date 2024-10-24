"use client"

import { useEffect, useRef, useCallback, useState } from "react";
import { useRetailerSales } from "@/contexts/retailerSales-context";
import { useRouter } from "next/navigation";
import Table from "./table";
import ContextMenu from "./context-menu";
import Pagination from "../composites/pagination";
import Checkbox from "../elements/checkbox";
import { twMerge } from "tailwind-merge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";

export default function DataTable() {
  const router = useRouter();
  const tableRef = useRef();
  const contextMenuRef = useRef();
  const { data, sortData, selectedData, setSelectedData, fetchRetailerSales } = useRetailerSales();

  const numberOfDataPerPage = 8;
  const [hasFetched, setHasFetched] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const indexOfLastData = currentPage * numberOfDataPerPage;
  const indexOfFirstData = indexOfLastData - numberOfDataPerPage;

  const currentData = data?.data?.slice(indexOfFirstData, indexOfLastData) || [];

  const fetchSalesData = useCallback(() => {
    if (!hasFetched) {
      fetchRetailerSales(); 
      setHasFetched(true); 
    }
  }, [fetchRetailerSales, hasFetched]);

  const handleTableHeadingCheckboxChange = () => {
    setSelectedData((prev) =>
      prev.length > 0
        ? prev.length < data?.data.length
          ? [...data?.data]
          : []
        : [...data?.data]
    );
  };

  useEffect(() => {
    fetchSalesData(); // Fetch sales data on mount
  }, [fetchSalesData]);

  const handleTableDataCheckboxChange = (clickedData) => {
    setSelectedData((prev) =>
      isTableDataSelected(clickedData)
        ? prev.filter((eachPrev) => eachPrev.name !== clickedData.name)
        : [...prev, clickedData]
    );
  };

  const isTableHeadingSelected = () => {
    return selectedData.length === data?.data?.length;
  };

  const isTableDataSelected = (datum) => {
    return selectedData.some((selected) => selected.name === datum.name);
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

              {data?.columns?.map((column) => (
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
            {currentData.map((datum, idx) => (
              <Table.Row key={idx} className={twMerge((idx + 1) % 2 !== 0 ? "bg-white" : "")}>
                <Table.Column className="px-4 py-2">
                  <Checkbox
                    onChange={() => handleTableDataCheckboxChange(datum)}
                    checked={isTableDataSelected(datum)}
                  />
                </Table.Column>

                <Table.Column className="px-2">{datum.name}</Table.Column>
                <Table.Column className="px-2">{datum.email}</Table.Column>
                <Table.Column className="overflow-hidden p-2">
                  <span className="line-clamp-1">{datum.phoneNumber}</span>
                </Table.Column>

                <Table.Column className="p-2">
                  <span>{datum.soldProducts?.productName || "N/A"}</span>
                </Table.Column>
                <Table.Column className="p-2">
                  <span>{datum.soldProducts?.productPrice || "N/A"}</span>
                </Table.Column>
                <Table.Column className="p-2">
                  <span>{datum.soldProducts?.batchId || "N/A"}</span>
                </Table.Column>
                <Table.Column className="p-2">
                  {new Date(datum.soldProducts?.createdAt).toLocaleString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                    second: "numeric",
                    hour12: true,
                  })}
                </Table.Column>

                <Table.Column className="p-2">
                  <ContextMenu className="relative" tableRef={tableRef} contextMenuRef={contextMenuRef}>
                    <ContextMenu.Trigger>
                      <FontAwesomeIcon icon={faEllipsisVertical} className="fa-fw" />
                    </ContextMenu.Trigger>

                    <ContextMenu.Menu
                      className="absolute z-10 w-[175px] space-y-1 text-white"
                      contextMenuRef={contextMenuRef}
                    >
                      <ContextMenu.Item className="rounded-md bg-[#017082]" onClick={() => {}}>
                        View
                      </ContextMenu.Item>
                      <ContextMenu.Item className="rounded-md bg-[#017082]" onClick={() => {}}>
                        Edit
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
          totalNumberOfData={data?.data?.length || 0}
          numberOfDataPerPage={numberOfDataPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}

