import React, { useState } from "react";
import {
  useGetPlatformFinancialsQuery,
  useGetPlatformFinancialsReportQuery,
} from "@/features/api/adminApi";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Hourglass,
  Download,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const StatCard = ({ title, value, icon, description }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">৳{value.toLocaleString()}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const Financials = () => {
  const [period, setPeriod] = useState("all");
  const { data, isLoading, isError, error } =
    useGetPlatformFinancialsQuery(period);
  const { refetch: fetchReport } = useGetPlatformFinancialsReportQuery(
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
      a.download = `platform_financial_report_${period}.${format}`;
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Platform Financials</h1>
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
          title="Total Gross Revenue"
          value={financials.totalRevenue}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          description="Total amount paid by all students."
        />
        <StatCard
          title="Net Platform Income"
          value={financials.netPlatformIncome}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          description="Total platform fees collected."
        />
        <StatCard
          title="Total Instructor Earnings"
          value={financials.totalInstructorEarnings}
          icon={<TrendingDown className="h-4 w-4 text-muted-foreground" />}
          description="Total amount earned by instructors."
        />
        <StatCard
          title="Total Paid to Instructors"
          value={financials.totalPaidOut}
          icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
          description="Total amount successfully paid out."
        />
        <StatCard
          title="Pending Payouts"
          value={financials.pendingPayouts}
          icon={<Hourglass className="h-4 w-4 text-muted-foreground" />}
          description="Amount waiting to be paid out."
        />
      </div>
    </div>
  );
};

export default Financials;
