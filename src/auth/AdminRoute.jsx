import { Navigate } from "react-router-dom";
import { isAuthenticated } from ".";
import { parseJwt } from "../utils";

const AdminRoute = ({ children }) => {
  return isAuthenticated() && parseJwt(isAuthenticated().token)?.isAdmin ? (
    children
  ) : (
    <Navigate to="/dashboard" />
  );
};

export default AdminRoute;
