import { Button } from "@/components/ui/button";
import React from "react";
import { Link, useParams } from "react-router-dom";
import CourseTab from "./CourseTab";
import { BookOpen, Notebook, BarChart, MessageSquare } from "lucide-react";

const EditCourse = () => {
  const { courseId } = useParams();

  return (
    <div className="flex-1">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <h1 className="font-bold text-xl">Course Builder</h1>
        <div className="flex items-center gap-4 flex-wrap">
          <Link to={`/admin/course/${courseId}/lecture`}>
            <Button
              className="hover:text-blue-600 flex items-center gap-2"
              variant="outline"
            >
              <BookOpen size={16} /> Lectures
            </Button>
          </Link>
          <Link to={`/admin/course/${courseId}/quiz`}>
            <Button
              className="hover:text-green-600 flex items-center gap-2"
              variant="outline"
            >
              <Notebook size={16} /> Quiz Editor
            </Button>
          </Link>
          <Link to={`/admin/course/${courseId}/qna`}>
            <Button
              className="hover:text-yellow-600 flex items-center gap-2"
              variant="outline"
            >
              <MessageSquare size={16} /> Q&A Management
            </Button>
          </Link>
          <Link to={`/admin/course/${courseId}/quiz-results`}>
            <Button
              className="hover:text-purple-600 flex items-center gap-2"
              variant="outline"
            >
              <BarChart size={16} /> Quiz Results
            </Button>
          </Link>
        </div>
      </div>
      <CourseTab />
    </div>
  );
};

export default EditCourse;
