import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  useGetCourseProgressQuery,
  useUpdateLectureProgressMutation,
  useCompleteCourseMutation,
  useInCompleteCourseMutation,
} from "@/features/api/courseProgressApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import QnaSection from "@/components/QnaSection";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "sonner";
import { CheckCircle, CheckCircle2, CirclePlay, Notebook } from "lucide-react";
import ReactPlayer from "react-player";

const CourseProgress = () => {
  const params = useParams();
  const courseId = params.courseId;
  const { data, isLoading, isError, refetch } =
    useGetCourseProgressQuery(courseId);

  const [updateLectureProgress] = useUpdateLectureProgressMutation();
  const [
    completeCourse,
    { data: markCompleteData, isSuccess: completedSuccess },
  ] = useCompleteCourseMutation();
  const [
    inCompleteCourse,
    { data: markInCompleteData, isSuccess: inCompletedSuccess },
  ] = useInCompleteCourseMutation();

  useEffect(() => {
    if (completedSuccess) {
      refetch();
      toast.success(markCompleteData.message);
    }
    if (inCompletedSuccess) {
      refetch();
      toast.success(markInCompleteData.message);
    }
  }, [completedSuccess, inCompletedSuccess]);

  const [currentLecture, setCurrentLecture] = useState(null);

  useEffect(() => {
    if (data?.data?.courseDetails?.lectures?.length > 0 && !currentLecture) {
      setCurrentLecture(data.data.courseDetails.lectures[0]);
    }
  }, [data, currentLecture]);

  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return <p className="text-center p-10">Failed to load course details.</p>;

  const { courseDetails, progress, completed } = data.data;
  const { courseTitle, quiz: quizId } = courseDetails;

  const isLectureCompleted = (lectureId) => {
    return progress.some((prog) => prog.lectureId === lectureId && prog.viewed);
  };

  const handleLectureProgress = async (lectureId) => {
    if (!isLectureCompleted(lectureId)) {
      await updateLectureProgress({ courseId, lectureId });
      refetch();
    }
  };

  const handleSelectLecture = (lecture) => {
    setCurrentLecture(lecture);
  };

  const handleCompleteCourse = async () => {
    await completeCourse(courseId);
  };

  const handleInCompleteCourse = async () => {
    await inCompleteCourse(courseId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-center sm:text-left">
          {courseTitle}
        </h1>
        {completed && quizId ? (
          <Link to={`/course/${courseId}/quiz`}>
            <Button className="flex items-center gap-2">
              <Notebook size={16} /> Take the Quiz
            </Button>
          </Link>
        ) : (
          <Button
            onClick={completed ? handleInCompleteCourse : handleCompleteCourse}
            variant={completed ? "outline" : "default"}
          >
            {completed ? (
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                <span>Completed</span>
              </div>
            ) : (
              "Mark as Completed"
            )}
          </Button>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3 w-full">
          {currentLecture ? (
            <>
              <div className="aspect-video bg-black rounded-lg shadow-lg overflow-hidden">
                <ReactPlayer
                  key={currentLecture._id}
                  url={currentLecture.videoUrl}
                  controls
                  playing
                  width="100%"
                  height="100%"
                  onEnded={() => handleLectureProgress(currentLecture._id)}
                />
              </div>
              <div className="mt-4">
                <h3 className="font-bold text-xl">
                  {`Lecture ${
                    courseDetails.lectures.findIndex(
                      (lec) => lec._id === currentLecture._id
                    ) + 1
                  }: ${currentLecture.lectureTitle}`}
                </h3>
              </div>
              <QnaSection lectureId={currentLecture._id} courseId={courseId} />
            </>
          ) : (
            <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center">
              <p>No lectures available for this course.</p>
            </div>
          )}
        </div>

        <div className="w-full lg:w-1/3">
          <h2 className="font-semibold text-xl mb-4">Course Lectures</h2>
          <div className="flex flex-col gap-3 max-h-[75vh] overflow-y-auto pr-2">
            {courseDetails?.lectures.map((lecture) => (
              <Card
                key={lecture._id}
                className={`w-full hover:cursor-pointer transition transform hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  lecture._id === currentLecture?._id
                    ? "bg-gray-200 dark:bg-gray-800 border-blue-500"
                    : ""
                }`}
                onClick={() => handleSelectLecture(lecture)}
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    {isLectureCompleted(lecture._id) ? (
                      <CheckCircle2
                        size={24}
                        className="text-green-500 flex-shrink-0"
                      />
                    ) : (
                      <CirclePlay
                        size={24}
                        className="text-gray-500 flex-shrink-0"
                      />
                    )}
                    <CardTitle className="text-base font-medium">
                      {lecture.lectureTitle}
                    </CardTitle>
                  </div>
                  {isLectureCompleted(lecture._id) && (
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border-green-300 dark:border-green-700"
                    >
                      Completed
                    </Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseProgress;
