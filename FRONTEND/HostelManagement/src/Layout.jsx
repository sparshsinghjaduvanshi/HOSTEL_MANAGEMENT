import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div>
      {/* You can add navbar here later */}
      <Outlet />
    </div>
  );
};

export default Layout;