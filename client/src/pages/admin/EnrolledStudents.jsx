import React, { useState, useMemo } from "react";
import { useGetEnrolledStudentsQuery } from "@/features/api/instructorApi";
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
import { Badge } from "@/components/ui/badge";
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
    <Card>
      <CardHeader>
        <CardTitle>Enrolled Students</CardTitle>
        <CardDescription>
          A list of all students enrolled in your courses.
        </CardDescription>

        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <Input
            placeholder="Search by student name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-full md:w-[250px]">
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
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Enrolled Course</TableHead>
              <TableHead className="text-right">Enrollment Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length > 0 ? (
              currentItems.map((enrollment) => (
                <TableRow key={enrollment._id}>
                  <TableCell className="font-medium">
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
                      {enrollment.userId.name}
                    </div>
                  </TableCell>
                  <TableCell>{enrollment.userId.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {enrollment.courseId.courseTitle}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {new Date(enrollment.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="4" className="text-center h-24">
                  No students found for the selected criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

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
            <span className="text-sm">
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
      </CardContent>
    </Card>
  );
};

export default EnrolledStudents;
