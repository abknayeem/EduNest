import React, { useState, useMemo } from "react";
import {
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/features/api/categoryApi";
import { useGetCategoryStatsQuery } from "@/features/api/adminApi";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, Edit, PlusCircle, ArrowUpDown } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

const CategoryManagement = () => {
  const {
    data: statsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetCategoryStatsQuery();
  const [addCategory] = useAddCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  const filteredAndSortedCategories = useMemo(() => {
    let categories = statsData?.categoryStats || [];

    if (searchTerm) {
      categories = categories.filter((category) =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortConfig.key) {
      categories.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return categories;
  }, [statsData, searchTerm, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };


  const handleAddNew = () => {
    setCurrentCategory(null);
    setCategoryName("");
    setIsDialogOpen(true);
  };

  const handleEdit = (category) => {
    setCurrentCategory(category);
    setCategoryName(category.name);
    setIsDialogOpen(true);
  };

  const handleDelete = (categoryId) => {
    toast.promise(deleteCategory(categoryId).unwrap(), {
      loading: "Deleting category...",
      success: (data) => {
        refetch();
        return data.message;
      },
      error: (err) => err.data?.message || "Failed to delete category.",
    });
  };

  const handleSave = async () => {
    const action = currentCategory
      ? updateCategory({ id: currentCategory._id, name: categoryName })
      : addCategory({ name: categoryName });

    try {
      const result = await action.unwrap();
      toast.success(result.message);
      setIsDialogOpen(false);
      refetch();
    } catch (err) {
      toast.error(err.data?.message || "An error occurred.");
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError)
    return (
      <div className="text-red-500 p-4">
        Error: {error.data?.message || "Failed to load categories."}
      </div>
    );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <CardTitle>Category Management</CardTitle>
              <CardDescription>
                Add, edit, or delete categories and view their performance.
              </CardDescription>
            </div>
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Category
            </Button>
        </div>

         <div className="mt-4 flex flex-col md:flex-row gap-4">
            <Input
                placeholder="Search by category name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
            />
        </div>

      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category Name</TableHead>
              <TableHead className="text-center cursor-pointer" onClick={() => requestSort('publishedCourses')}>
                <div className="flex items-center justify-center">
                    Published Courses <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="text-center cursor-pointer" onClick={() => requestSort('totalCourses')}>
                <div className="flex items-center justify-center">
                    Total Courses <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
               <TableHead className="text-right cursor-pointer" onClick={() => requestSort('totalRevenue')}>
                 <div className="flex items-center justify-end">
                    Total Revenue <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="text-right">Date Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedCategories.map((category) => (
              <TableRow key={category._id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="text-center">
                  {category.publishedCourses}
                </TableCell>
                <TableCell className="text-center">
                  {category.totalCourses}
                </TableCell>
                <TableCell className="text-right">
                  ৳{category.totalRevenue.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                    {new Date(category.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(category)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(category._id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {currentCategory ? "Edit" : "Add"} Category
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Category Name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CategoryManagement;