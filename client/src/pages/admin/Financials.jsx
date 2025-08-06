import React, { useState } from "react";
import {
  useGetInstructorFinancialsQuery,
  useGetInstructorFinancialsReportQuery,
} from "@/features/api/instructorApi";
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
  TrendingUp,
  TrendingDown,
  Wallet,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const StatCard = ({ title, value, icon, className }) => (
  <Card className={className}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">৳{value.toLocaleString()}</div>
    </CardContent>
  </Card>
);

const Financials = () => {
  const [period, setPeriod] = useState("all");
  const { data, isLoading, isError, error } =
    useGetInstructorFinancialsQuery(period);
  const { refetch: fetchReport } = useGetInstructorFinancialsReportQuery(
    { period, format: "pdf" },
    { skip: true }
  );

  const handleGenerateReport = async (format) => {
    try {
      toast.loading(`Generating ${format.toUpperCase()} report...`);
      const response = await fetchReport({ period, format }).unwrap();
      const blob = new Blob([response], {
        type: format === "pdf" ? "application/pdf" : "text/csv",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `instructor_financial_report_${period}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Report generated successfully!");
    } catch (err) {
      console.error("Report generation error:", err);
      toast.error(err?.data?.message || "Failed to generate report.");
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return (
      <div className="text-red-500 p-4">
        Error: {error.data?.message || "Failed to load financial data."}
      </div>
    );

  const { financials } = data;
  const { summary, courseSales, payouts } = financials;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Financial Statement</h1>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="daily">Last 30 Days</SelectItem>
              <SelectItem value="weekly">Last 12 Weeks</SelectItem>
              <SelectItem value="monthly">Last 12 Months</SelectItem>
              <SelectItem value="yearly">Last 5 Years</SelectItem>
            </SelectContent>
          </Select>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" /> Generate Report
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleGenerateReport("pdf")}>
                Download PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleGenerateReport("csv")}>
                Download CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Net Earnings"
          value={summary.totalEarned}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          className="bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700"
        />
        <StatCard
          title="Total Paid Out"
          value={summary.totalPaidOut}
          icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Total Platform Fees"
          value={summary.platformFees}
          icon={<TrendingDown className="h-4 w-4 text-muted-foreground" />}
          className="bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales by Course</CardTitle>
          <CardDescription>
            A breakdown of your earnings for each course.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Title</TableHead>
                <TableHead className="text-right">Total Sales</TableHead>
                <TableHead className="text-right">Gross Revenue</TableHead>
                <TableHead className="text-right">Platform Fee</TableHead>
                <TableHead className="text-right">Net Income</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courseSales.length > 0 ? (
                courseSales.map((course) => (
                  <TableRow key={course._id}>
                    <TableCell className="font-medium">
                      {course.courseTitle}
                    </TableCell>
                    <TableCell className="text-right">
                      {course.totalSales}
                    </TableCell>
                    <TableCell className="text-right">
                      ৳{course.totalRevenue.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-red-500">
                      - ৳{course.totalPlatformFee.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      ৳{course.netIncome.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan="5" className="text-center h-24">
                    No sales data available for this period.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Financials;
