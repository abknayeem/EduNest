import React, { useState } from "react";
import { useGetPlatformAnalyticsQuery } from "@/features/api/adminApi";
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const AnalyticsDashboard = () => {
  const [period, setPeriod] = useState("monthly");
  const [categoryPeriod, setCategoryPeriod] = useState("all");
  const { data, isLoading, isError, error } = useGetPlatformAnalyticsQuery({
    period,
    categoryPeriod,
  });

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
  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#AF19FF",
    "#FF1943",
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>
              Platform-wide revenue for the selected period.
            </CardDescription>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily (Last 30 days)</SelectItem>
              <SelectItem value="weekly">Weekly (Last 12 weeks)</SelectItem>
              <SelectItem value="monthly">Monthly (Last 12 months)</SelectItem>
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
                formatter={(value) => [`৳${value.toLocaleString()}`, "Revenue"]}
              />
              <Legend />
              <Bar dataKey="revenue" fill="#8884d8" name="Revenue (BDT)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <Card>
          <CardHeader>
            <CardTitle>Top 5 Earning Instructors</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Instructor</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.topInstructors?.length > 0 ? (
                  stats.topInstructors.map((instructor) => (
                    <TableRow key={instructor._id}>
                      <TableCell className="font-medium">
                        {instructor.name}
                      </TableCell>
                      <TableCell className="text-right">
                        ৳{instructor.revenue.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan="2" className="text-center h-24">
                      No data available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Revenue by Category</CardTitle>
            <Select value={categoryPeriod} onValueChange={setCategoryPeriod}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="yearly">Last Year</SelectItem>
                <SelectItem value="monthly">Last Month</SelectItem>
                <SelectItem value="weekly">Last Week</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={stats.categoryRevenue}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="_id" type="category" width={120} />
                <Tooltip
                  formatter={(value) => [
                    `৳${value.toLocaleString()}`,
                    "Revenue",
                  ]}
                />
                <Legend />
                <Bar dataKey="revenue" name="Revenue (BDT)">
                  {stats.categoryRevenue.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
