import React from 'react';
import { useSelector } from 'react-redux';
import { useGetUserCourseProgressQuery } from '@/features/api/adminApi';
import { useGetStudentProgressQuery } from '@/features/api/instructorApi';
import { Badge } from "@/components/ui/badge";

const StudentCourseProgress = ({ userId, courseId }) => {
  const { user } = useSelector((state) => state.auth);
  
  const queryHook = user?.role === 'superadmin' 
    ? useGetUserCourseProgressQuery 
    : useGetStudentProgressQuery;

  const { data, isLoading, isError } = queryHook({ 
    userId: userId, 
    studentId: userId,
    courseId: courseId 
  });

  if (isLoading) return <span className="text-xs text-muted-foreground">Loading...</span>;
  if (isError) return <Badge variant="destructive">Error</Badge>;

  return (
    <span className="font-medium">{data?.progress ?? 0}%</span>
  );
};

export default StudentCourseProgress;