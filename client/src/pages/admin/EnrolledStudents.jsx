import React, { useState, useMemo } from "react";
import { useGetEnrolledStudentsQuery } from "@/features/api/instructorApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import StudentCourseProgress from '@/components/StudentCourseProgress';
import { Search } from "lucide-react";

const EnrolledStudents = () => {
  const { data, isLoading, isError, error } = useGetEnrolledStudentsQuery();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const filteredStudents = useMemo(() => {
    if (!data?.enrolledStudents) return [];

    return (
      data.enrolledStudents
        .filter((enrollment) => enrollment.userId && enrollment.courseId)
        .filter((enrollment) => {
          if (selectedCourse === "all") return true;
          return enrollment.courseId._id === selectedCourse;
        })
        .filter((enrollment) => {
          const studentName = enrollment.userId.name.toLowerCase();
          const studentEmail = enrollment.userId.email.toLowerCase();
          return (
            studentName.includes(searchTerm.toLowerCase()) ||
            studentEmail.includes(searchTerm.toLowerCase())
          );
        })
    );
  }, [data, searchTerm, selectedCourse]);

  const uniqueCourses = useMemo(() => {
    if (!data?.enrolledStudents) return [];
    const courses = new Map();
    data.enrolledStudents
      .filter((enrollment) => enrollment.courseId)
      .forEach((enrollment) => {
        courses.set(enrollment.courseId._id, enrollment.courseId.courseTitle);
      });
    return Array.from(courses, ([_id, courseTitle]) => ({ _id, courseTitle }));
  }, [data]);

  const lastItemIndex = currentPage * itemsPerPage;
  const firstItemIndex = lastItemIndex - itemsPerPage;
  const currentItems = filteredStudents.slice(firstItemIndex, lastItemIndex);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <div className="text-red-500 p-4">
        Error: {error.data?.message || "Failed to load enrolled students."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
              <h1 className="text-2xl font-bold">Enrolled Students</h1>
              <p className="mt-1 text-muted-foreground">
                A list of all students enrolled in your courses.
              </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full"
              />
            </div>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-full md:w-[220px]">
                <SelectValue placeholder="Filter by course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {uniqueCourses.map((course) => (
                  <SelectItem key={course._id} value={course._id}>
                    {course.courseTitle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
      </div>

      <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead>Enrolled Course</TableHead>
                <TableHead className="text-center">Progress</TableHead>
                <TableHead className="text-right">Enrolled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.length > 0 ? (
                currentItems.map((enrollment) => (
                  <TableRow key={enrollment._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage
                            src={enrollment.userId.photoUrl}
                            alt={enrollment.userId.name}
                          />
                          <AvatarFallback>
                            {enrollment.userId.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{enrollment.userId.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{enrollment.userId.email}</TableCell>
                    <TableCell className="font-medium">
                      {enrollment.courseId.courseTitle}
                    </TableCell>
                    <TableCell className="text-center">
                      <StudentCourseProgress userId={enrollment.userId._id} courseId={enrollment.courseId._id} />
                    </TableCell>
                    <TableCell className="text-right">
                      {new Date(enrollment.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan="5" className="text-center h-24">
                    No students found for the selected criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default EnrolledStudents;