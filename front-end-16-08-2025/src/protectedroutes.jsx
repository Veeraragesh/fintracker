import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return (
      <Navigate
        to="/"
        replace
        state={{ message: "Please login to continue" }}
      />
    );
  }

  return children;
};

export default ProtectedRoute;
