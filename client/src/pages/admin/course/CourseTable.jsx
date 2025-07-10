import React, { useState, useMemo } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetCreatorCourseQuery } from "@/features/api/courseApi";
import { Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // NEW: Import Select

export const CourseTable = () => {
  const { data, isLoading } = useGetCreatorCourseQuery();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const filteredCourses = useMemo(() => {
    if (!data?.courses) return [];

    return data.courses
      .filter(course => {
        // Filter by status
        if (statusFilter === 'all') return true;
        const isPublished = statusFilter === 'published';
        return course.isPublished === isPublished;
      })
      .filter(course => {
        // Filter by search term (course title)
        return course.courseTitle.toLowerCase().includes(searchTerm.toLowerCase());
      });
  }, [data, searchTerm, statusFilter]);

  if (isLoading) return <h1>Loading....</h1>

  return (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Your Courses</h1>
            <Button onClick={() => navigate(`create`)}>Create a New Course</Button>
        </div>
        
        {/* NEW: Filter and Search Controls */}
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

        <Table>
            <TableCaption>A list of your recent courses.</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {/* MODIFIED: Map over the filtered list */}
                {filteredCourses.length > 0 ? (
                    filteredCourses.map((course) => (
                        <TableRow key={course._id}>
                            <TableCell className="font-medium">{course?.coursePrice ? `৳${course.coursePrice}` : "N/A"}</TableCell>
                            <TableCell><Badge variant={course.isPublished ? 'default' : 'secondary'}>{course.isPublished ? "Published" : "Draft"}</Badge></TableCell>
                            <TableCell>{course.courseTitle}</TableCell>
                            <TableCell className="text-right">
                                <Button size='sm' variant='ghost' onClick={() => navigate(`${course._id}`)}><Edit/></Button>
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan="4" className="text-center h-24">
                            No courses found.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    </div>
  );
};

export default CourseTable;