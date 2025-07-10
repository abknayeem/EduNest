import React, { useState } from "react";
import { useGetInstructorMonthlySalesQuery } from "@/features/api/adminApi";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { Loader2 } from "lucide-react";

const InstructorAnalyticsModal = ({ instructor }) => {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const { data, isLoading, isError } = useGetInstructorMonthlySalesQuery({
    instructorId: instructor._id,
    year,
  });

  const years = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <>
      <DialogHeader>
        <DialogTitle>Monthly Revenue for {instructor.name}</DialogTitle>
        <DialogDescription>
          View sales and revenue for each month of the selected year.
        </DialogDescription>
      </DialogHeader>
      <div className="my-4">
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="max-h-[60vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : isError ? (
          <p className="text-red-500">Failed to load analytics.</p>
        ) : data?.sales.length === 0 ? (
          <p>No sales data found for {year}.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Month</TableHead>
                <TableHead>Course Title</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Sales</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.sales.map((monthData) =>
                monthData.courses.map((course, index) => (
                  <TableRow key={`${monthData.month}-${course.title}-${index}`}>
                    {index === 0 && (
                      <TableCell
                        rowSpan={monthData.courses.length}
                        className="font-medium align-top"
                      >
                        {months[monthData.month - 1]}
                        <p className="font-bold text-lg mt-1">
                          ৳{monthData.revenue.toLocaleString()}
                        </p>
                      </TableCell>
                    )}
                    <TableCell>{course.title}</TableCell>
                    <TableCell>
                      {new Date(course.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">{course.sales}</TableCell>
                    <TableCell className="text-right">
                      ৳{course.revenue.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </>
  );
};

export default InstructorAnalyticsModal;