import { useGetAdminStatsQuery, useGetAllInstructorsQuery, useGetPendingRequestsCountQuery } from "@/features/api/adminApi";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Users, BookOpen, BarChart2, CircleDollarSign, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const StatCard = ({ title, value, icon, formatAsCurrency = false }) => (
    <Card className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">
                {formatAsCurrency ? `৳${Number(value).toLocaleString()}` : value}
            </div>
        </CardContent>
    </Card>
);

const SuperadminDashboard = () => {
    const { data: statsData, isLoading: statsLoading, isError: statsError } = useGetAdminStatsQuery();
    const { data: instructorsData, isLoading: instructorsLoading, isError: instructorsError } = useGetAllInstructorsQuery();
    const { data: pendingData, isLoading: pendingLoading } = useGetPendingRequestsCountQuery();

    if (statsLoading || instructorsLoading || pendingLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin" />
            </div>
        );
    }
    
    if (statsError || instructorsError) {
        return <div className="text-red-500 p-8">Error loading dashboard data. Please try again later.</div>
    }

    const { stats } = statsData || {};
    const { instructors } = instructorsData || [];
    const pendingCount = pendingData?.count || 0;
    
    return (
        <main className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Link to="/sadmin/users?filter=pending">
                  <StatCard 
                    title="Instructor Requests" 
                    value={pendingCount} 
                    icon={<AlertCircle className={`h-4 w-4 ${pendingCount > 0 ? 'text-amber-500' : 'text-muted-foreground'}`} />} 
                  />
                </Link>
                <StatCard title="Total Revenue" value={stats?.totalRevenue || 0} icon={<CircleDollarSign className="h-4 w-4 text-muted-foreground" />} formatAsCurrency />
                <StatCard title="Total Sales" value={stats?.totalSales || 0} icon={<BarChart2 className="h-4 w-4 text-muted-foreground" />} />
                <StatCard title="Students" value={stats?.totalStudents || 0} icon={<Users className="h-4 w-4 text-muted-foreground" />} />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Instructor Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Instructor</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead className="text-center">Courses</TableHead>
                                <TableHead className="text-center">Total Enrolled Students</TableHead>
                                <TableHead className="text-right">Total Revenue</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {instructors?.map((instructor) => (
                                <TableRow key={instructor._id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <Avatar>
                                            <AvatarImage src={instructor.photoUrl} alt={instructor.name} />
                                            <AvatarFallback>{instructor.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        {instructor.name}
                                    </TableCell>
                                    <TableCell>{instructor.email}</TableCell>
                                    <TableCell className="text-center">{instructor.courseCount}</TableCell>
                                    <TableCell className="text-center">{instructor.totalStudents}</TableCell>
                                    <TableCell className="text-right">৳{Number(instructor.totalRevenue).toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </main>
    );
};

export default SuperadminDashboard;
