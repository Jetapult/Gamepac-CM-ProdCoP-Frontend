import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '.';

const UnprotectedRoute = ({ children }) => {
  return !isAuthenticated() ? children : <Navigate to="/home" />;
};

export default UnprotectedRoute;