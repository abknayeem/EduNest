import React, { useState, useMemo } from "react";
import {
  useGetAllInstructorsQuery,
  useUpdateUserRoleMutation,
  useDeleteInstructorMutation,
  useUpdateUserStatusMutation,
} from "@/features/api/adminApi";
import { Link } from "react-router-dom";
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
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, Loader2, Eye, Info } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import InstructorAnalyticsModal from "@/components/InstructorAnalyticsModal";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // NEW: Import Select components

// NEW: RoleSelector component to manage role changes
const RoleSelector = ({ user, onUpdateRole }) => {
    const handleRoleChange = (newRole) => {
        if (newRole !== user.role) {
            onUpdateRole({ userId: user._id, role: newRole });
        }
    };

    return (
        <Select defaultValue={user.role} onValueChange={handleRoleChange}>
             <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="instructor">Instructor</SelectItem>
                <SelectItem value="student">Student</SelectItem>
            </SelectContent>
        </Select>
    );
};

const InstructorManagement = () => {
  const {
    data: instructorsData,
    isLoading,
    isError,
    error,
  } = useGetAllInstructorsQuery();
  const [updateUserRole] = useUpdateUserRoleMutation();
  const [deleteInstructor, { isLoading: isDeleting }] =
    useDeleteInstructorMutation();
  const [updateUserStatus] = useUpdateUserStatusMutation();

  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredInstructors = useMemo(() => {
    let instructors = instructorsData?.instructors || [];

    if (searchTerm) {
      instructors = instructors.filter(
        (instructor) =>
          instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          instructor.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return instructors;
  }, [instructorsData, searchTerm]);

  const handleRoleChange = async ({ userId, role }) => {
    const promise = updateUserRole({
      userId,
      role,
    }).unwrap();
    toast.promise(promise, {
      loading: "Updating role...",
      success: (data) => data.message,
      error: (err) => err.data?.message || "Failed to update role.",
    });
  };

  const handleStatusChange = (user, newStatus) => {
    const promise = updateUserStatus({ userId: user._id, isDisabled: newStatus }).unwrap();
    toast.promise(promise, {
        loading: `Updating status for ${user.name}...`,
        success: (data) => data.message,
        error: (err) => err.data?.message || 'Failed to update status.',
    });
  };

  const handleDelete = (instructorId, instructorName) => {
    const promise = deleteInstructor(instructorId).unwrap();
    toast.promise(promise, {
      loading: `Deleting ${instructorName}...`,
      success: (data) => data.message,
      error: (err) => err.data?.message || "Failed to delete instructor.",
    });
  };

  const handleViewAnalytics = (instructor) => {
    setSelectedInstructor(instructor);
    setIsAnalyticsOpen(true);
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) {
    return (
      <div className="text-red-500 p-4">
        Error: {error.data?.message || "Failed to load instructors."}
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Instructor Management</CardTitle>
              <CardDescription>
                Manage instructor roles, view analytics, and delete accounts.
              </CardDescription>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Instructor</TableHead>
                <TableHead className="text-center">Courses</TableHead>
                <TableHead className="text-center">Students</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Manage Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInstructors.map((instructor) => (
                <TableRow key={instructor._id} className={instructor.isDisabled ? 'bg-red-900/20' : ''}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={instructor.photoUrl}
                          alt={instructor.name}
                        />
                        <AvatarFallback>
                          {instructor.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{instructor.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {instructor.courseCount}
                  </TableCell>
                  <TableCell className="text-center">
                    {instructor.totalStudents}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                        <Switch
                            checked={!instructor.isDisabled}
                            onCheckedChange={(checked) => handleStatusChange(instructor, !checked)}
                            id={`status-switch-${instructor._id}`}
                        />
                        <Label htmlFor={`status-switch-${instructor._id}`}>{instructor.isDisabled ? 'Disabled' : 'Enabled'}</Label>
                    </div>
                  </TableCell>
                  <TableCell>
                    <RoleSelector user={instructor} onUpdateRole={handleRoleChange} />
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link to={`/sadmin/instructor-details/${instructor._id}`}>
                      <Button variant="outline" size="icon" title="View Details">
                        <Info className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="icon"
                      title="View Analytics"
                      onClick={() => handleViewAnalytics(instructor)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete Instructor"
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-red-500" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the instructor "
                            {instructor.name}" and all of their courses, sales
                            data, and lectures. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              handleDelete(instructor._id, instructor.name)
                            }
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Dialog open={isAnalyticsOpen} onOpenChange={setIsAnalyticsOpen}>
        <DialogContent className="max-w-4xl">
          {selectedInstructor && (
            <InstructorAnalyticsModal instructor={selectedInstructor} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InstructorManagement;
