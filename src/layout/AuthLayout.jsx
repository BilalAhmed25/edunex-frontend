import React, { Suspense } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import Loading from "@/components/Loading";

const AuthLayout = () => {
  const { isAuth } = useSelector((state) => state.auth);

  // Already logged in → send to dashboard
  if (isAuth) return <Navigate to="/dashboard" replace />;

  return (
    <div className="auth-wrapper">
      <div className="auth-page-height">
        <Suspense fallback={<Loading />}>
          <ToastContainer />
          {<Outlet />}
        </Suspense>
      </div>
    </div>
  );
};

export default AuthLayout;

