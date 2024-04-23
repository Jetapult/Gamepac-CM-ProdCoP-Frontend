import React, { useEffect } from "react";
import "./admin.css";
import AdminLayout from "../../components/AdminLayout";
import StudioDetails from "./StudioDetails";
import { useDispatch, useSelector } from "react-redux";
import { addStudioData } from "../../store/reducer/adminSlice";

const AdminLandingPage = () => {
  const userData = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  useEffect(()=>{
    if(!userData?.studio_type?.includes("studio_manager")){
      const studioData = {
        "id": userData?.studio_id,
        "studio_name": userData?.studio_name,
        "contact_email": userData?.contact_email,
        "phone": userData?.phone,
        "studio_type": userData?.studio_type,
        "slug": userData?.slug,
        "studio_logo": userData?.studio_logo
      }
      dispatch(addStudioData(studioData));
    }
  },[userData])
  return (
    <>
      {userData?.studio_type?.includes("studio_manager") ? (
        <AdminLayout>
          <StudioDetails />
        </AdminLayout>
      ) : (
        <div className="w-[1400px] mx-auto pt-10">
          <StudioDetails />
        </div>
      )}
    </>
  );
};

export default AdminLandingPage;
