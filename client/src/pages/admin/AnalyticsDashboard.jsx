import React, { useState } from "react";
import { useGetInstructorAnalyticsQuery } from "@/features/api/instructorApi";
import LoadingSpinner from "@/components/LoadingSpinner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  Users,
  BookOpen,
  BarChart as BarChartIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const StatCard = ({ title, value, icon, formatAsCurrency = false }) => (
  <Card>
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

const AnalyticsDashboard = () => {
  const [period, setPeriod] = useState("monthly");
  const { data, isLoading, isError, error } =
    useGetInstructorAnalyticsQuery(period);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isError) {
    return (
      <div className="text-red-500 p-4">
        Error: {error.data?.message || "Failed to load analytics."}
      </div>
    );
  }

  const { stats } = data || {};

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={stats.totalRevenue}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          formatAsCurrency
        />
        <StatCard
          title="Total Sales"
          value={stats.totalSales}
          icon={<BarChartIcon className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Total Courses"
          value={stats.totalCourses}
          icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Revenue Overview</CardTitle>
              <CardDescription>
                Showing data for the selected period.
              </CardDescription>
            </div>
          
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily (Last 30 days)</SelectItem>
                <SelectItem value="weekly">Weekly (Last 12 weeks)</SelectItem>
                <SelectItem value="monthly">
                  Monthly (Last 12 months)
                </SelectItem>
                <SelectItem value="yearly">Yearly (Last 5 years)</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [
                    `৳${value.toLocaleString()}`,
                    "Revenue",
                  ]}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" name="Revenue (BDT)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Top 5 Courses by Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.topCourses?.length > 0 ? (
                  stats.topCourses.map((course) => (
                    <TableRow key={course._id}>
                      <TableCell className="font-medium">
                        {course.title}
                      </TableCell>
                      <TableCell className="text-right">
                        ৳{course.revenue.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan="2" className="text-center h-24">
                      No sales data available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
