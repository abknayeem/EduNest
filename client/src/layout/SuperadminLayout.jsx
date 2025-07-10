import React from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  LogOut,
  BookCopy,
  NotebookText,
  Moon,
  Sun,
  BarChartHorizontalBig,
  UserCog,
  Receipt,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogoutUserMutation } from "@/features/api/authApi";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { useTheme } from "@/components/ThemeProvider";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const SuperadminLayout = () => {
  const [logoutUser, { isSuccess }] = useLogoutUserMutation();
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const { setTheme } = useTheme();
  const location = useLocation();
  const [isAnalyticsOpen, setIsAnalyticsOpen] = React.useState(
    location.pathname.startsWith('/sadmin/analytics') || location.pathname.startsWith('/sadmin/transactions')
  );


  React.useEffect(() => {
    if (isSuccess) {
      toast.success("Logged out successfully.");
      navigate("/sadmin");
    }
  }, [isSuccess, navigate]);

  const handleLogout = () => logoutUser();

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <aside className="w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col">
        <div className="p-6 text-2xl font-bold border-b dark:border-gray-700">
          EduNest Admin
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/sadmin/dashboard"
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>

          <Collapsible open={isAnalyticsOpen} onOpenChange={setIsAnalyticsOpen}>
            <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between px-4">
                    <div className="flex items-center gap-3">
                        <BarChartHorizontalBig size={20} />
                        <span>Analytics</span>
                    </div>
                    <ChevronRight className={cn("h-4 w-4 transition-transform", isAnalyticsOpen && "rotate-90")} />
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-1 pl-6 pt-1">
                 <Link
                    to="/sadmin/analytics"
                    className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <LayoutDashboard size={16} />
                    <span>Platform Analytics</span>
                  </Link>
                <Link
                    to="/sadmin/transactions"
                    className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    <Receipt size={16} />
                    <span>Transactions</span>
                </Link>
            </CollapsibleContent>
          </Collapsible>

          <Link
            to="/sadmin/users"
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Users size={20} />
            <span>User Management</span>
          </Link>
          <Link
            to="/sadmin/instructor-management"
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <UserCog size={20} />
            <span>Instructor Management</span>
          </Link>
          <Link
            to="/sadmin/courses"
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <BookCopy size={20} />
            <span>Course Management</span>
          </Link>
          <Link
            to="/sadmin/categories"
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <NotebookText size={20} />
            <span>Category Management</span>
          </Link>
        </nav>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700 h-16">
          <h1 className="text-2xl font-bold">Dash Board</h1>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.photoUrl} alt={user?.name} />
                  <AvatarFallback>
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Sun className="h-4 w-4 mr-2 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-4 w-4 mr-2 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span>Toggle theme</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    System
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SuperadminLayout;