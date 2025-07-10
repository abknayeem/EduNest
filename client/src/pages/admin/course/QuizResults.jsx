import React from "react";
import { useParams, Link } from "react-router-dom";
import { useGetQuizAttemptsByCourseQuery } from "@/features/api/instructorApi";
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
import { ArrowLeft } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

const QuizResults = () => {
  const { courseId } = useParams();
  const { data, isLoading, isError } =
    useGetQuizAttemptsByCourseQuery(courseId);

  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return <p className="text-red-500">Failed to load quiz results.</p>;

  return (
    <div>
      <Link
        to={`/admin/course/${courseId}`}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Course Editor
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Quiz Results</CardTitle>
          <CardDescription>
            Results for all students who have attempted the quiz for this
            course.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-center">Score</TableHead>
                <TableHead className="text-center">Percentage</TableHead>
                <TableHead className="text-center">Result</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.attempts.length > 0 ? (
                data.attempts.map((attempt) => (
                  <TableRow key={attempt._id}>
                    <TableCell className="font-medium">
                      {attempt.student.name}
                    </TableCell>
                    <TableCell>{attempt.student.email}</TableCell>
                    <TableCell className="text-center">
                      {attempt.score} / {attempt.totalQuestions}
                    </TableCell>
                    <TableCell className="text-center">
                      {Math.round(
                        (attempt.score / attempt.totalQuestions) * 100
                      )}
                      %
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={attempt.passed ? "default" : "destructive"}
                      >
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
                  <TableCell colSpan="6" className="text-center h-24">
                    No quiz attempts found for this course yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizResults;
