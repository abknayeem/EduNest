import React, { useState, useMemo } from "react";
import {
  useGetAllUsersQuery,
  useUpdateUserRoleMutation,
  useCreateUserByAdminMutation,
  useDeleteUserMutation,
  useRefuseInstructorRequestMutation,
  useUpdateUserStatusMutation,
} from "@/features/api/adminApi";
import { Link, useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  PlusCircle,
  Loader2,
  Trash2,
  Eye,
  Info,
  XCircle,
  MoreHorizontal,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const checkEligibility = (user) => {
  const missingFields = [];
  if (!user.isVerified) missingFields.push("Email not verified");
  if (!user.photoUrl) missingFields.push("Profile Photo");
  if (!user.alternativeNumber) missingFields.push("Phone Number");

  // MODIFIED: This is the updated eligibility logic
  if (!user.educationHistory || user.educationHistory.length === 0) {
    missingFields.push("Education");
  }

  if (!user.occupation) missingFields.push("Occupation");
  return {
    isEligible: missingFields.length === 0,
    missingFields: missingFields,
  };
};

const UserManagement = () => {
  const { data, isLoading, isError, error } = useGetAllUsersQuery();
  const [updateUserRole] = useUpdateUserRoleMutation();
  const [createUser, { isLoading: isCreating }] =
    useCreateUserByAdminMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [refuseRequest, { isLoading: isRefusing }] =
    useRefuseInstructorRequestMutation();
  const [updateUserStatus] = useUpdateUserStatusMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [searchParams] = useSearchParams();
  const initialFilter = searchParams.get("filter");

  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [applicationFilter, setApplicationFilter] = useState(
    initialFilter || "all"
  );

  const handleUpdateRole = async ({ userId, role }) => {
    const promise = updateUserRole({ userId, role }).unwrap();
    toast.promise(promise, {
      loading: "Updating user role...",
      success: (data) => data.message,
      error: (err) => err.data?.message || "Failed to update role.",
    });
  };

  const handleStatusChange = (user) => {
    const newStatus = !user.isDisabled;
    const promise = updateUserStatus({
      userId: user._id,
      isDisabled: newStatus,
    }).unwrap();
    toast.promise(promise, {
      loading: `Updating status for ${user.name}...`,
      success: (data) => data.message,
      error: (err) => err.data?.message || "Failed to update status.",
    });
  };

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error("Please fill all fields.");
      return;
    }
    const promise = createUser(newUser).unwrap();
    toast.promise(promise, {
      loading: "Creating user...",
      success: (data) => {
        setIsDialogOpen(false);
        setNewUser({ name: "", email: "", password: "", role: "student" });
        return data.message;
      },
      error: (err) => err.data?.message || "Failed to create user.",
    });
  };

  const handleDeleteUser = (user) => {
    const promise = deleteUser(user._id).unwrap();
    toast.promise(promise, {
      loading: `Deleting ${user.name}...`,
      success: (data) => data.message,
      error: (err) => err.data?.message || "Failed to delete user.",
    });
  };

  const handleRefuseRequest = (user) => {
    const promise = refuseRequest(user._id).unwrap();
    toast.promise(promise, {
      loading: `Refusing application for ${user.name}...`,
      success: (data) => data.message,
      error: (err) => err.data?.message || "Failed to refuse application.",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleSelect = (value) => {
    setNewUser((prev) => ({ ...prev, role: value }));
  };

  const filteredUsers = useMemo(() => {
    if (!data?.users) return [];
    return (data.users || [])
      .filter((user) => user.role !== "superadmin")
      .filter((user) => {
        const searchMatch =
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase());
        const roleMatch = roleFilter === "all" || user.role === roleFilter;
        const statusMatch =
          statusFilter === "all" || String(!user.isDisabled) === statusFilter;
        const applicationMatch =
          applicationFilter === "all" ||
          user.instructorApplicationStatus === applicationFilter;
        return searchMatch && roleMatch && statusMatch && applicationMatch;
      });
  }, [data, searchTerm, roleFilter, statusFilter, applicationFilter]);

  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return (
      <div className="text-red-500 p-4">
        Error: {error.data?.message || "Failed to load users."}
      </div>
    );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              View all students and instructors and manage their status.
            </CardDescription>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Create User
          </Button>
        </div>
        <div className="flex flex-col md:flex-row gap-2 mt-4 items-center">
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="student">Students</SelectItem>
              <SelectItem value="instructor">Instructors</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="true">Enabled</SelectItem>
              <SelectItem value="false">Disabled</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={applicationFilter}
            onValueChange={setApplicationFilter}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by Application" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applications</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Eligibility</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => {
                const eligibility = checkEligibility(user);
                return (
                  <TableRow key={user._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.photoUrl} alt={user.name} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          user.role === "instructor" &&
                            "bg-purple-200 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300",
                          "capitalize"
                        )}
                      >
                        {user.role}
                      </Badge>
                      {user.instructorApplicationStatus === "pending" && (
                        <Badge
                          variant="outline"
                          className="ml-2 w-fit text-amber-600 border-amber-500"
                        >
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.role === "student" ? (
                        eligibility.isEligible ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
                            Eligible
                          </Badge>
                        ) : (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger className="flex items-center gap-1 cursor-help">
                                <Badge variant="destructive">Incomplete</Badge>
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  Missing:{" "}
                                  {eligibility.missingFields.join(", ")}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.isDisabled ? "destructive" : "default"}
                        className={cn(
                          !user.isDisabled &&
                            "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
                        )}
                      >
                        {user.isDisabled ? "Disabled" : "Enabled"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link to={`/sadmin/users/${user._id}/details`}>
                              <Eye className="mr-2 h-4 w-4" /> View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange(user)}
                          >
                            {user.isDisabled ? (
                              <ToggleRight className="mr-2 h-4 w-4" />
                            ) : (
                              <ToggleLeft className="mr-2 h-4 w-4" />
                            )}
                            {user.isDisabled ? "Enable User" : "Disable User"}
                          </DropdownMenuItem>
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              Change Role
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent>
                              <DropdownMenuItem
                                disabled={user.role === "student"}
                                onClick={() =>
                                  handleUpdateRole({
                                    userId: user._id,
                                    role: "student",
                                  })
                                }
                              >
                                Set as Student
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={
                                  user.role === "instructor" ||
                                  !eligibility.isEligible
                                }
                                onClick={() =>
                                  handleUpdateRole({
                                    userId: user._id,
                                    role: "instructor",
                                  })
                                }
                              >
                                Set as Instructor
                              </DropdownMenuItem>
                            </DropdownMenuSubContent>
                          </DropdownMenuSub>
                          {user.instructorApplicationStatus === "pending" && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-amber-600 focus:text-amber-700"
                                >
                                  <XCircle className="mr-2 h-4 w-4" /> Refuse
                                  Request
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Refuse Instructor Application?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will reject the application from "
                                    {user.name}".
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleRefuseRequest(user)}
                                    className="bg-amber-600 hover:bg-amber-700"
                                  >
                                    Yes, Refuse
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-red-600 focus:text-red-700"
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete User
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Are you sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete "{user.name}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteUser(user)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan="5" className="text-center h-24">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                value={newUser.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={newUser.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={newUser.password}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="role">Role</Label>
              <Select value={newUser.role} onValueChange={handleRoleSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="instructor">Instructor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser} disabled={isCreating}>
              {isCreating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default UserManagement;
