import React, { useState, useMemo } from "react";
import { useGetAllTransactionsQuery } from "@/features/api/adminApi";
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";

const months = [
    { value: 1, label: 'January' }, { value: 2, label: 'February' },
    { value: 3, label: 'March' }, { value: 4, label: 'April' },
    { value: 5, label: 'May' }, { value: 6, label: 'June' },
    { value: 7, label: 'July' }, { value: 8, label: 'August' },
    { value: 9, label: 'September' }, { value: 10, label: 'October' },
    { value: 11, label: 'November' }, { value: 12, label: 'December' },
];

const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);


const TransactionManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const { data, isLoading, isError, error } = useGetAllTransactionsQuery({
      month: selectedMonth,
      year: selectedYear
  });

  const filteredTransactions = useMemo(() => {
    if (!data?.transactions) return [];

    return data.transactions.filter((tx) => {
      if (statusFilter !== "all" && tx.status !== statusFilter) {
        return false;
      }
      const lowerSearchTerm = searchTerm.toLowerCase();
      const courseTitle = tx.courseId?.courseTitle?.toLowerCase() || "";
      const studentName = tx.userId?.name?.toLowerCase() || "";
      const instructorName = tx.courseId?.creator?.name?.toLowerCase() || "";
      return (
        courseTitle.includes(lowerSearchTerm) ||
        studentName.includes(lowerSearchTerm) ||
        instructorName.includes(lowerSearchTerm)
      );
    });
  }, [data, searchTerm, statusFilter]);
  
  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSelectedMonth("");
    setSelectedYear("");
  };


  if (isLoading) return <LoadingSpinner />;
  if (isError) return <div className="text-red-500 p-4">Error: {error.data?.message || "Failed to load transactions."}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Management</CardTitle>
        <CardDescription>View and filter all transactions on the platform.</CardDescription>
        <div className="flex flex-wrap items-end gap-4 pt-4">
            <Input
              placeholder="Search course, student, or instructor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Filter by Month" /></SelectTrigger>
              <SelectContent>
                {months.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full md:w-[120px]"><SelectValue placeholder="Filter by Year" /></SelectTrigger>
              <SelectContent>
                {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
             <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleClearFilters}>Clear Filters</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course Title</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.map((tx) => (
              <TableRow key={tx._id}>
                <TableCell className="font-medium">{tx.courseId?.courseTitle || "N/A"}</TableCell>
                <TableCell>{tx.userId?.name || "N/A"}</TableCell>
                <TableCell>{tx.courseId?.creator?.name || "N/A"}</TableCell>
                <TableCell>৳{tx.amount.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge 
                    variant={tx.status === 'completed' ? 'default' : (tx.status === 'pending' ? 'secondary' : 'destructive')}
                    className="capitalize"
                  >
                    {tx.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{new Date(tx.createdAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
             {filteredTransactions.length === 0 && (
                <TableRow>
                    <TableCell colSpan="6" className="text-center h-24">
                        No transactions found for the selected criteria.
                    </TableCell>
                </TableRow>
             )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default TransactionManagement;