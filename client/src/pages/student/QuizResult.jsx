import React from "react";
import { useParams, Link } from "react-router-dom";
import {
  useGetQuizResultQuery,
  useSendCertificateMutation,
} from "@/features/api/quizApi";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Award, Mail, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const QuizResult = () => {
  const { attemptId } = useParams();
  const {
    data: resultData,
    isLoading,
    isError,
  } = useGetQuizResultQuery(attemptId);
  const [sendCertificate, { isLoading: isSending }] =
    useSendCertificateMutation();

  const handleSendCertificate = () => {
    toast.promise(sendCertificate(attemptId).unwrap(), {
      loading: "Sending certificate to your email...",
      success: "Certificate sent successfully! Please check your inbox.",
      error: "Failed to send certificate.",
    });
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return (
      <div className="text-center p-10">
        <h2>Could not load quiz results.</h2>
      </div>
    );

  const { attempt, courseTitle, courseId } = resultData;
  const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100);

  return (
    <div className="max-w-4xl mx-auto my-8 p-4">
      <Card className="text-center">
        <CardHeader>
          <Award className="mx-auto h-16 w-16 text-yellow-500" />
          <CardTitle className="text-3xl mt-4">Quiz Completed!</CardTitle>
          <CardDescription>
            Results for the quiz from: {courseTitle}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-5xl font-bold">{percentage}%</p>
          <p className="text-lg text-muted-foreground mt-2">
            You answered {attempt.score} out of {attempt.totalQuestions}{" "}
            questions correctly.
          </p>
        </CardContent>
        {attempt.passed && (
          <CardFooter className="flex-col gap-4">
            <p className="text-green-600 font-semibold">
              Congratulations, you passed!
            </p>
            <Button onClick={handleSendCertificate} disabled={isSending}>
              {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Mail className="mr-2 h-4 w-4" />
              Email My Certificate
            </Button>
          </CardFooter>
        )}
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Review Your Answers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {attempt.answers.map((answer, index) => (
            <div key={answer._id} className="p-4 rounded-md border">
              <p className="font-semibold">
                {index + 1}. {answer.questionText}
              </p>
              <div className="mt-2 space-y-1 text-sm">
                <p>
                  <strong>Your Answer:</strong>{" "}
                  <span
                    className={cn(
                      answer.isCorrect ? "text-green-600" : "text-red-600"
                    )}
                  >
                    {answer.selectedAnswer}
                  </span>
                </p>
                {!answer.isCorrect && (
                  <p>
                    <strong>Correct Answer:</strong>{" "}
                    <span className="text-green-600">
                      {answer.correctAnswer}
                    </span>
                  </p>
                )}
              </div>
              {answer.isCorrect ? (
                <CheckCircle className="h-5 w-5 text-green-500 mt-2" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500 mt-2" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="mt-8 text-center">
        <Link to={`/course-progress/${courseId}`}>
          <Button variant="outline">Back to Course</Button>
        </Link>
      </div>
    </div>
  );
};

export default QuizResult;
