import {
  ChartNoAxesColumn,
  SquareLibrary,
  Users,
  ArrowLeftCircle,
  Landmark,
} from "lucide-react";
import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { Separator } from "@/components/ui/separator";

const getNavLinkClass = ({ isActive }) =>
  `flex items-center gap-4 p-3 rounded-lg text-sm transition-colors ${
    isActive
      ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-200 font-semibold"
      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
  }`;

const Sidebar = () => {
  const { user } = useSelector((store) => store.auth);

  return (
    <div className="flex">
      <div className="hidden lg:block w-[250px] sm:w-[300px] space-y-2 border-r border-gray-300 dark:border-gray-700 p-4 sticky top-16 h-[calc(100vh-4rem)]">
        <nav className="space-y-2">
          {user?.role === "superadmin" && (
            <>
              <NavLink
                to="/sadmin/dashboard"
                className="flex items-center gap-4 p-3 rounded-lg text-sm text-purple-600 dark:text-purple-400 font-semibold hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
              >
                <ArrowLeftCircle size={20} />
                <span>Back to Superadmin</span>
              </NavLink>
              <Separator className="my-3" />
            </>
          )}

          <NavLink to="analytics" className={getNavLinkClass}>
            <ChartNoAxesColumn size={20} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="financials" className={getNavLinkClass}>
            <Landmark size={20} />
            <span>Financials</span>
          </NavLink>

          <NavLink to="course" className={getNavLinkClass}>
            <SquareLibrary size={20} />
            <span>Courses</span>
          </NavLink>
          <NavLink to="enrolled-students" className={getNavLinkClass}>
            <Users size={20} />
            <span>Enrolled Students</span>
          </NavLink>
        </nav>
      </div>
      <main className="flex-1 p-10 dark:bg-[#141414]">
        <Outlet />
      </main>
    </div>
  );
};

export default Sidebar;
