import React, { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  useGetQuestionsForCourseQuery,
  useAddAnswerMutation,
  useUpdateAnswerMutation,
  useDeleteAnswerMutation,
} from "@/features/api/qnaApi";
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Send, ArrowLeft, Edit, Trash2 } from "lucide-react";
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
import { toast } from "sonner";
import LoadingSpinner from "@/components/LoadingSpinner";

const AnswerItem = ({ answer, courseId }) => {
  const { user: currentUser } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(answer.content);

  const [updateAnswer, { isLoading: isUpdating }] = useUpdateAnswerMutation();
  const [deleteAnswer, { isLoading: isDeleting }] = useDeleteAnswerMutation();

  const canEdit =
    currentUser._id === answer.user._id || currentUser.role === "superadmin";

  const handleUpdate = () => {
    if (!editedContent.trim()) return;
    updateAnswer({ answerId: answer._id, content: editedContent, courseId })
      .unwrap()
      .then(() => {
        toast.success("Answer updated.");
        setIsEditing(false);
      })
      .catch(() => toast.error("Failed to update answer."));
  };

  const handleDelete = () => {
    deleteAnswer({ answerId: answer._id, courseId })
      .unwrap()
      .then(() => toast.success("Answer deleted."))
      .catch(() => toast.error("Failed to delete answer."));
  };

  return (
    <div className="flex items-start gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={answer.user.photoUrl} alt={answer.user.name} />
        <AvatarFallback>{answer.user.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="w-full">
        <p className="text-sm font-semibold">
          {answer.user.name}
          {answer.user._id === currentUser._id && (
            <span className="ml-2 text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 px-2 py-0.5 rounded-full">
              You
            </span>
          )}
        </p>
        {isEditing ? (
          <div className="space-y-2 mt-1">
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleUpdate} disabled={isUpdating}>
                {isUpdating && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm">{answer.content}</p>
        )}
      </div>
      {canEdit && !isEditing && (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsEditing(true)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  this answer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
};

const AnswerForm = ({ questionId, courseId }) => {
  const [content, setContent] = useState("");
  const [addAnswer, { isLoading }] = useAddAnswerMutation();

  const handlePostAnswer = () => {
    if (!content.trim()) return;
    addAnswer({ questionId, content, courseId })
      .unwrap()
      .then(() => {
        setContent("");
        toast.success("Answer posted!");
      })
      .catch(() => toast.error("Failed to post answer."));
  };

  return (
    <div className="flex items-center gap-2 mt-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your answer..."
        className="text-sm"
      />
      <Button onClick={handlePostAnswer} disabled={isLoading} size="icon">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};

const QnaManagement = () => {
  const { courseId } = useParams();
  const { data, isLoading, isError } = useGetQuestionsForCourseQuery(courseId);

  const questionsByLecture = useMemo(() => {
    if (!data?.questions) return {};
    return data.questions.reduce((acc, q) => {
      const lectureId = q.lecture._id;
      if (!acc[lectureId]) {
        acc[lectureId] = { title: q.lecture.lectureTitle, questions: [] };
      }
      acc[lectureId].questions.push(q);
      return acc;
    }, {});
  }, [data]);

  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return (
      <p className="text-red-500 p-4">Failed to load Q&A for this course.</p>
    );

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
          <CardTitle>Q&A Management</CardTitle>
          <CardDescription>
            Review and answer questions from your students for this course.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {Object.keys(questionsByLecture).length > 0 ? (
            Object.entries(questionsByLecture).map(
              ([lectureId, { title, questions }]) => (
                <div key={lectureId}>
                  <h3 className="text-lg font-semibold border-b pb-2 mb-4">
                    {title}
                  </h3>
                  <div className="space-y-6">
                    {questions.map((q) => (
                      <div
                        key={q._id}
                        className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={q.user.photoUrl}
                              alt={q.user.name}
                            />
                            <AvatarFallback>
                              {q.user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{q.title}</p>
                            <p className="text-sm text-muted-foreground">
                              by {q.user.name}
                            </p>
                            {q.content && (
                              <p className="mt-2 text-sm">{q.content}</p>
                            )}
                          </div>
                        </div>
                        <div className="pl-12 mt-4 space-y-4">
                          {q.answers.map((answer) => (
                            <AnswerItem
                              key={answer._id}
                              answer={answer}
                              courseId={courseId}
                            />
                          ))}
                          <AnswerForm questionId={q._id} courseId={courseId} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )
          ) : (
            <div className="text-center py-10">
              <p>No questions have been asked in this course yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QnaManagement;
