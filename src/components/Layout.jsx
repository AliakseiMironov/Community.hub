import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";

const Layout = () => {
  const location = useLocation();
  const hideHeaderPaths = ["/login", "/signup", "/forgot-password"];

  return (
    <>
      {!hideHeaderPaths.includes(location.pathname) && <Header />}
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default Layout;
