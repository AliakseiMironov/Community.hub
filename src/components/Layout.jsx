import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const Layout = () => {
  const location = useLocation();
  const hideHeaderPaths = ["/login", "/signup", "/forgot-password"];
  
  return (
    <>
      {!hideHeaderPaths.includes(location.pathname) && <Header />}
      <main>
        <Outlet />
      </main>
      {!hideHeaderPaths.includes(location.pathname) && <Footer />}
    </>
  );
};

export default Layout;
