import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useGetInstructorDetailsQuery } from '@/features/api/adminApi';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const StatCard = ({ title, value }) => (
    <Card>
        <CardHeader className="pb-2">
            <CardDescription>{title}</CardDescription>
            <CardTitle className="text-4xl">{value}</CardTitle>
        </CardHeader>
    </Card>
);

const DetailRow = ({ label, value }) => (
    <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-md text-gray-900 dark:text-white">{value || 'N/A'}</p>
    </div>
);

const InstructorDetails = () => {
    const { instructorId } = useParams();
    const { data, isLoading, isError, error } = useGetInstructorDetailsQuery(instructorId);

    if (isLoading) return <LoadingSpinner />;
    if (isError) return <div className="text-red-500">Error: {error.data?.message || 'Failed to load details.'}</div>;

    const { instructor, courses, totalRevenue, totalStudents } = data.details;

    return (
        <div className="space-y-6">
            <Link to="/sadmin/instructor-management" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                Back to Instructor Management
            </Link>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-24 w-24">
                            <AvatarImage src={instructor.photoUrl} alt={instructor.name} />
                            <AvatarFallback>{instructor.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-2xl">{instructor.name}</CardTitle>
                            <CardDescription>{instructor.email}</CardDescription>
                            <CardDescription>Joined: {new Date(instructor.createdAt).toLocaleDateString()}</CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Revenue" value={`৳${totalRevenue.toLocaleString()}`} />
                <StatCard title="Total Students" value={totalStudents.toLocaleString()} />
                <StatCard title="Total Courses" value={courses.length} />
                 <StatCard title="Status" value={instructor.isDisabled ? 'Disabled' : 'Enabled'} />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                       <DetailRow label="Phone Number" value={instructor.alternativeNumber} />
                       <DetailRow label="Age" value={instructor.age} />
                       <DetailRow label="Gender" value={instructor.gender} />
                       <DetailRow label="Occupation" value={instructor.occupation} />
                       <div className="col-span-2">
                        <DetailRow label="Address" value={instructor.address} />
                       </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Educational Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                       <DetailRow label="Background" value={instructor.education} />
                       <DetailRow label="Institute" value={instructor.institute} />
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Courses by {instructor.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Enrolled</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created At</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {courses.map((course) => (
                                <TableRow key={course._id}>
                                    <TableCell className="font-medium">{course.courseTitle}</TableCell>
                                    <TableCell>৳{course.coursePrice.toLocaleString()}</TableCell>
                                    <TableCell>{course.enrolledStudents.length}</TableCell>
                                    <TableCell>
                                        <Badge variant={course.isPublished ? 'default' : 'secondary'}>
                                            {course.isPublished ? 'Published' : 'Draft'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{new Date(course.createdAt).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default InstructorDetails;