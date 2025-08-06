import React, { useState } from "react";
import { useGetInstructorAnalyticsQuery } from "@/features/api/instructorApi";
import { useRequestPayoutMutation } from "@/features/api/payoutApi";
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
  Loader2,
  Wallet,
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
import { useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const StatCard = ({ title, value, icon, formatAsCurrency = false, action }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {formatAsCurrency ? `৳${Number(value).toLocaleString()}` : value}
      </div>
      {action}
    </CardContent>
  </Card>
);

const PayoutDialog = ({ balance }) => {
  const [amount, setAmount] = useState("");
  const [requestPayout, { isLoading }] = useRequestPayoutMutation();

  const handleRequest = () => {
    toast.promise(requestPayout({ amount: Number(amount) }).unwrap(), {
      loading: "Submitting request...",
      success: "Payout request submitted!",
      error: (err) => err.data?.message || "Failed to submit request.",
    });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Request a Payout</DialogTitle>
        <DialogDescription>
          Your current available balance is ৳{balance.toLocaleString()}.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-2">
        <Label htmlFor="amount">Amount to withdraw</Label>
        <Input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g., 1500"
        />
      </div>
      <DialogFooter>
        <Button onClick={handleRequest} disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Request
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

const AnalyticsDashboard = () => {
  const [period, setPeriod] = useState("monthly");
  const { user } = useSelector((store) => store.auth);
  const { data, isLoading, isError, error } =
    useGetInstructorAnalyticsQuery(period);

  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return (
      <div className="text-red-500 p-4">
        Error: {error.data?.message || "Failed to load analytics."}
      </div>
    );

  const { stats } = data || {};

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Dialog>
          <StatCard
            title="Available Balance"
            value={user?.currentBalance || 0}
            icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
            formatAsCurrency
            action={
              <DialogTrigger asChild>
                <Button variant="link" className="p-0 h-auto text-xs">
                  Request Payout
                </Button>
              </DialogTrigger>
            }
          />
          <PayoutDialog balance={user?.currentBalance || 0} />
        </Dialog>
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
