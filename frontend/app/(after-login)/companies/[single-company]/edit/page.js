"use client"; 
import EditCompanyForm from "@/components/structures/company-edit-form";
import EditSingleCompanyProvider from "@/contexts/edit-single-company-form";
import EditCompany from "@/components/structures/company-single-page";
import React from "react";

export default function SingleCompanyEdit({params}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl">Edit Company</h2>
      </div>

      <div>
        <EditSingleCompanyProvider>
        <EditCompany params={params} />
        </EditSingleCompanyProvider>
      </div>
    </div>
  );
}
