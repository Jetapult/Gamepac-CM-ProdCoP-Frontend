import React from "react";
import "./admin.css";
import AdminLayout from "../../components/AdminLayout";
import StudioDetails from "./StudioDetails";

const AdminLandingPage = () => {
  return (
    <AdminLayout>
      <StudioDetails />
    </AdminLayout>
  );
};

export default AdminLandingPage;
