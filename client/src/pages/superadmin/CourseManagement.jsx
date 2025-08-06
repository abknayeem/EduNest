import React, { useState, useMemo } from "react";
import {
  useGetAllCoursesForAdminQuery,
  useUpdateCoursePublicationStatusMutation,
  useGetAllInstructorsQuery,
} from "@/features/api/adminApi";
import { useDeleteCourseMutation } from "@/features/api/courseApi";
import { useGetCategoriesQuery } from "@/features/api/categoryApi";
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
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Loader2,
  AlertTriangle,
  Eye,
  Settings,
  MoreHorizontal,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const CourseManagement = () => {
  const { data, isLoading, isError, error } = useGetAllCoursesForAdminQuery();
  const [updateStatus] = useUpdateCoursePublicationStatusMutation();
  const [deleteCourse, { isLoading: isDeleting }] = useDeleteCourseMutation();
  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetCategoriesQuery();
  const { data: instructorsData, isLoading: instructorsLoading } =
    useGetAllInstructorsQuery();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deletionFilter, setDeletionFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [instructorFilter, setInstructorFilter] = useState("all");

  const handleStatusChange = async (courseId, currentStatus) => {
    const promise = updateStatus({
      courseId,
      isPublished: !currentStatus,
    }).unwrap();
    toast.promise(promise, {
      loading: "Updating status...",
      success: (data) => data.message,
      error: (err) => err.data?.message || "Failed to update status.",
    });
  };

  const handleDelete = (courseId, courseTitle) => {
    const promise = deleteCourse(courseId).unwrap();
    toast.promise(promise, {
      loading: `Deleting "${courseTitle}"...`,
      success: (data) => data.message,
      error: (err) => err.data?.message || "Failed to delete course.",
    });
  };

  const filteredCourses = useMemo(() => {
    if (!data?.courses) return [];

    return data.courses.filter((course) => {
      if (statusFilter !== "all" && String(course.isPublished) !== statusFilter)
        return false;
      if (categoryFilter !== "all" && course.category !== categoryFilter)
        return false;
      if (
        instructorFilter !== "all" &&
        (!course.creator || course.creator._id !== instructorFilter)
      )
        return false;
      if (deletionFilter === "requested" && !course.isDeletionRequested)
        return false;
      if (deletionFilter === "none" && course.isDeletionRequested) return false;

      const lowerSearchTerm = searchTerm.toLowerCase();
      return (
        course.courseTitle.toLowerCase().includes(lowerSearchTerm) ||
        (course.creator?.name &&
          course.creator.name.toLowerCase().includes(lowerSearchTerm))
      );
    });
  }, [
    data,
    searchTerm,
    statusFilter,
    deletionFilter,
    categoryFilter,
    instructorFilter,
  ]);

  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return (
      <div className="text-red-500 p-4">
        Error: {error.data?.message || "Failed to load courses."}
      </div>
    );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <CardTitle>Course Management</CardTitle>
            <CardDescription>
              View and manage all courses on the platform.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 flex-wrap">
            <Input
              placeholder="Search by Title or Instructor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-44"
            />
            <Select
              value={instructorFilter}
              onValueChange={setInstructorFilter}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by instructor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Instructors</SelectItem>
                {instructorsLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading...
                  </SelectItem>
                ) : (
                  instructorsData?.instructors.map((instructor) => (
                    <SelectItem key={instructor._id} value={instructor._id}>
                      {instructor.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoriesLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading...
                  </SelectItem>
                ) : (
                  categoriesData?.categories.map((cat) => (
                    <SelectItem key={cat._id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="true">Published</SelectItem>
                <SelectItem value="false">Unpublished</SelectItem>
              </SelectContent>
            </Select>
            <Select value={deletionFilter} onValueChange={setDeletionFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by deletion" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Deletion Statuses</SelectItem>
                <SelectItem value="requested">Deletion Requested</SelectItem>
                <SelectItem value="none">No Deletion Request</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCourses.map((course) => (
              <TableRow key={course._id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar className="hidden h-12 w-12 sm:flex">
                      <AvatarImage
                        src={course.courseThumbnail}
                        alt={course.courseTitle}
                      />
                      <AvatarFallback>
                        {course.courseTitle.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div>{course.courseTitle}</div>
                      <div className="text-xs text-muted-foreground">
                        {course.category}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{course.creator?.name || "N/A"}</TableCell>
                <TableCell>৳{course.coursePrice || 0}</TableCell>
                <TableCell>
                  <Badge
                    variant={course.isPublished ? "default" : "destructive"}
                  >
                    {course.isPublished ? "Published" : "Unpublished"}
                  </Badge>
                  {course.isDeletionRequested && (
                    <Badge variant="destructive" className="ml-2 animate-pulse">
                      <AlertTriangle className="h-3 w-3 mr-1" /> Deletion
                      Requested
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(course.createdAt).toLocaleDateString()}
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
                        <Link
                          to={`/course-detail/${course._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" /> View on Site
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/admin/course/${course._id}`}>
                          <Settings className="mr-2 h-4 w-4" /> Manage Course
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handleStatusChange(course._id, course.isPublished)
                        }
                      >
                        {course.isPublished ? (
                          <ToggleLeft className="mr-2 h-4 w-4" />
                        ) : (
                          <ToggleRight className="mr-2 h-4 w-4" />
                        )}
                        {course.isPublished ? "Unpublish" : "Publish"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            className="text-red-600 focus:text-red-700"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Course
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{course.courseTitle}
                              " and all related data. This action cannot be
                              undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                handleDelete(course._id, course.courseTitle)
                              }
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
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default CourseManagement;
