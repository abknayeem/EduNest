import React from "react";
import { useParams, Link } from "react-router-dom";
import {
  useGetUserDetailsForAdminQuery,
  useGetQuizAttemptsForUserQuery,
} from "@/features/api/adminApi";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";

const DetailRow = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
      {label}
    </p>
    <p className="text-md text-gray-900 dark:text-white">{value || "N/A"}</p>
  </div>
);

const UserQuizHistory = ({ userId }) => {
  const { data, isLoading } = useGetQuizAttemptsForUserQuery(userId);

  if (isLoading) return <p>Loading quiz history...</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course Title</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Result</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.attempts.length > 0 ? (
              data.attempts.map((attempt) => (
                <TableRow key={attempt._id}>
                  <TableCell>{attempt.course.courseTitle}</TableCell>
                  <TableCell>
                    {attempt.score} / {attempt.totalQuestions}
                  </TableCell>
                  <TableCell>
                    <Badge variant={attempt.passed ? "default" : "destructive"}>
                      {attempt.passed ? "Passed" : "Failed"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {new Date(attempt.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan="4" className="text-center h-24">
                  This user has not attempted any quizzes.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const UserDetails = () => {
  const { userId } = useParams();
  const { data, isLoading, isError, error } =
    useGetUserDetailsForAdminQuery(userId);

  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return (
      <div className="text-red-500">
        Error: {error.data?.message || "Failed to load user details."}
      </div>
    );

  const { user } = data;

  return (
    <div className="space-y-6">
      <Link
        to="/sadmin/users"
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to User Management
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.photoUrl} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
              <CardDescription>
                Role:{" "}
                <Badge variant="secondary" className="capitalize">
                  {user.role}
                </Badge>
              </CardDescription>
              <CardDescription>
                Joined: {new Date(user.createdAt).toLocaleDateString()}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <DetailRow label="Phone Number" value={user.alternativeNumber} />
            <DetailRow label="Age" value={user.age} />
            <DetailRow label="Gender" value={user.gender} />
            <DetailRow label="Occupation" value={user.occupation} />
            <div className="col-span-2">
              <DetailRow label="Address" value={user.address} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Educational Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <DetailRow label="Background" value={user.education} />
            <DetailRow label="Institute" value={user.institute} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Bio</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
            {user.bio || "This user has not provided a bio."}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enrolled Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Title</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {user.enrolledCourses.length > 0 ? (
                user.enrolledCourses.map((course) => (
                  <TableRow key={course._id}>
                    <TableCell className="font-medium">
                      {course.courseTitle}
                    </TableCell>
                    <TableCell>{course.creator?.name || "N/A"}</TableCell>
                    <TableCell>{course.category}</TableCell>
                    <TableCell className="text-right">
                      ৳{course.coursePrice?.toLocaleString() || "Free"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan="4" className="text-center h-24">
                    This user has not enrolled in any courses.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <UserQuizHistory userId={userId} />
    </div>
  );
};

export default UserDetails;
