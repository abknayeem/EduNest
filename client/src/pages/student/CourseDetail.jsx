import BuyCourseButton from "@/components/BuyCourseButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGetCourseDetailWithStatusQuery } from "@/features/api/purchaseApi";
import { BadgeInfo, PlayCircle, Lock } from "lucide-react";
import React from "react";
import ReactPlayer from "react-player";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const CourseDetail = () => {
  const params = useParams();
  const courseId = params.courseId;
  const navigate = useNavigate();
  const { data, isLoading, isError } =
    useGetCourseDetailWithStatusQuery(courseId);

  const { isAuthenticated } = useSelector((store) => store.auth);

  if (isLoading) return <h1>Loading...</h1>;
  if (isError) return <h2>Failed to load course details</h2>;

  const { course, purchased } = data;

  const handleContinueCourse = () => {
    if (purchased) {
      navigate(`/course-progress/${courseId}`);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-[#2D2F31] text-white">
        <div className="max-w-6xl mx-auto py-8 px-6 flex flex-col gap-2">
          <h1 className="font-bold text-2xl md:text-3xl">
            {course?.courseTitle}
          </h1>
          <p className="text-base md:text-lg">{course.subTitle}</p>
          <p>
            Created By{" "}
            <span className="text-[#C0C4FC] underline italic">
              {course?.creator.name}
            </span>
          </p>
          <div className="flex items-center gap-2 text-sm">
            <BadgeInfo size={16} />
            <p>Last updated {course?.createdAt.split("T")[0]}</p>
          </div>
          <p>Students enrolled: {course?.enrolledStudents.length}</p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto my-5 px-6 flex flex-col lg:flex-row justify-between gap-10">
        <div className="w-full lg:w-2/3 space-y-5">
          <h1 className="font-bold text-xl md:text-2xl">Description</h1>
          <div
            className="text-sm text-justify"
            dangerouslySetInnerHTML={{ __html:course.description }}
          />

          <Separator />

          <Card>
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
              <CardDescription>Lectures</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {course.lectures.map((lecture, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm">
                  <span>
                    {lecture.isPreviewFree || purchased ? <PlayCircle size={14} /> : <Lock size={14} />}
                  </span>
                  <p>{lecture.lectureTitle}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Separator />
          <div className="space-y-4 py-4">
              <h2 className="font-bold text-xl md:text-2xl">About the Instructor</h2>
              <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                      <AvatarImage src={course.creator.photoUrl} alt={course.creator.name} />
                      <AvatarFallback>{course.creator.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                      <h3 className="font-semibold text-lg">{course.creator.name}</h3>
                      <p className="text-sm text-muted-foreground">{course.creator.occupation || 'Instructor'}</p>
                  </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {course.creator.bio || "This instructor hasn't added a bio yet."}
              </p>
          </div>
          <Separator />

        </div>
        <div className="w-full lg:w-1/3">
          <Card>
            <CardContent className="p-4 flex flex-col">
              <div className="w-full aspect-video mb-4">
                <ReactPlayer
                  width="100%"
                  height={"100%"}
                  url={course.lectures[0].videoUrl}
                  controls={true}
                />
              </div>
              <h1><strong>Introduction</strong></h1>
              <Separator className="my-2" />
              <h1 className="text-lg md:text-xl font-semibold">৳{course.coursePrice}</h1>
            </CardContent>
            
            <CardFooter className="flex justify-center p-4">
              {isAuthenticated ? (
                purchased ? (
                  <Button onClick={handleContinueCourse} className="w-full">Continue Course</Button>
                ) : (
                  <BuyCourseButton courseId={courseId} />
                )
              ) : (
                <Button onClick={() => navigate('/login')} className="w-full">
                  Login to Purchase
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
