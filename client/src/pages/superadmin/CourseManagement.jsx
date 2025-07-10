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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, AlertTriangle, Eye } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      if (statusFilter !== "all") {
        if (String(course.isPublished) !== statusFilter) return false;
      }
      if (categoryFilter !== "all") {
        if (course.category !== categoryFilter) return false;
      }
      if (instructorFilter !== "all") {
        if (!course.creator || course.creator._id !== instructorFilter)
          return false;
      }
      if (deletionFilter === "requested" && !course.isDeletionRequested) {
        return false;
      }
      if (deletionFilter === "none" && course.isDeletionRequested) {
        return false;
      }
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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <div className="text-red-500 p-4">
        Error: {error.data?.message || "Failed to load courses."}
      </div>
    );
  }

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
              className="w-full md:w-44"
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
              <TableHead>Course Title</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Publish / Unpublish</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCourses.map((course) => (
              <TableRow key={course._id}>
                <TableCell className="font-medium">
                  {course.courseTitle}
                  {course.isDeletionRequested && (
                    <Badge variant="destructive" className="ml-2 animate-pulse">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Deletion Requested
                    </Badge>
                  )}
                </TableCell>
                <TableCell>{course.creator?.name || "N/A"}</TableCell>
                <TableCell>৳{course.coursePrice || 0}</TableCell>
                <TableCell>
                  <Badge
                    variant={course.isPublished ? "default" : "destructive"}
                  >
                    {course.isPublished ? "Published" : "Unpublished"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(course.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="pl-8">
                  <Switch
                    checked={course.isPublished}
                    onCheckedChange={() =>
                      handleStatusChange(course._id, course.isPublished)
                    }
                    aria-label={`Toggle publication status for ${course.courseTitle}`}
                  />
                </TableCell>
                <TableCell className="text-right space-x-2 align-middle">
                  <Link
                    to={`/course-detail/${course._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      size="icon"
                      title="View Course Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={isDeleting}
                        title="Delete Course"
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
                          This will permanently delete the course "
                          {course.courseTitle}" and all related data. This
                          action cannot be undone.
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
