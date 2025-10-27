import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";

export default function Layout() {
  const location = useLocation();
  const hideHeaderPaths = ["/login", "/register"];
  const hideHeader = hideHeaderPaths.includes(location.pathname);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {!hideHeader && <Header />}
      <div className="flex-1 min-h-0">
        <Outlet />
      </div>
    </div>
  );
}
