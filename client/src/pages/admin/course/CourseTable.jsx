import React, { useState, useMemo } from "react";
import { useGetCreatorCourseQuery } from "@/features/api/courseApi";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Edit,
  PlusCircle,
  ExternalLink,
  CalendarDays,
} from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

const CourseCard = ({ course }) => {
  const navigate = useNavigate();

  return (
    <Card className="flex flex-col">
      <CardHeader className="p-0 relative">
        <div className="absolute top-2 right-2 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 bg-white/80 hover:bg-white"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`${course._id}`)}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit Course</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  window.open(`/course-detail/${course._id}`, "_blank")
                }
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                <span>View on Site</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <img
          src={
            course.courseThumbnail ||
            "https://via.placeholder.com/400x225?text=No+Image"
          }
          alt={course.courseTitle}
          className="aspect-video w-full rounded-t-lg object-cover"
        />
      </CardHeader>
      <CardContent className="flex-grow p-4 space-y-2">
        <CardTitle
          className="text-lg leading-tight hover:underline cursor-pointer"
          onClick={() => navigate(`${course._id}`)}
        >
          {course.courseTitle}
        </CardTitle>
        {course.isPublished && course.publishedAt && (
          <div className="flex items-center text-xs text-muted-foreground pt-1">
            <CalendarDays className="h-3 w-3 mr-1.5" />
            <span>
              Published on {new Date(course.publishedAt).toLocaleDateString()}
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center">
        <Badge variant={course.isPublished ? "default" : "secondary"}>
          {course.isPublished ? "Published" : "Draft"}
        </Badge>
        <div className="font-semibold text-lg">
          {course?.coursePrice ? `৳${course.coursePrice}` : "Free"}
        </div>
      </CardFooter>
    </Card>
  );
};

export const CourseTable = () => {
  const { data, isLoading } = useGetCreatorCourseQuery();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredCourses = useMemo(() => {
    if (!data?.courses) return [];

    return data.courses
      .filter((course) => {
        if (statusFilter === "all") return true;
        const isPublished = statusFilter === "published";
        return course.isPublished === isPublished;
      })
      .filter((course) => {
        return course.courseTitle
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      });
  }, [data, searchTerm, statusFilter]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Your Courses</h1>
          <p className="text-muted-foreground">
            Manage, edit, and view your created courses.
          </p>
        </div>
        <Button onClick={() => navigate(`create`)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Course
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder="Search by course title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course._id} course={course} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">No Courses Found</h2>
          <p className="text-muted-foreground mt-2">
            It looks like you haven't created any courses that match the current
            filters.
          </p>
          <Button onClick={() => navigate(`create`)} className="mt-4">
            Create Your First Course
          </Button>
        </div>
      )}
    </div>
  );
};

export default CourseTable;
