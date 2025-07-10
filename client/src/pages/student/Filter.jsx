import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import React, { useState } from "react";
import { useGetCategoriesQuery } from '@/features/api/categoryApi';


const Filter = ({ handleFilterChange }) => {
  const { data: categoriesData, isLoading: categoriesLoading } = useGetCategoriesQuery();
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [sortByPrice, setSortByPrice] = useState("default");

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories((prevCategories) => {
      const newCategories = prevCategories.includes(categoryId)
        ? prevCategories.filter((id) => id !== categoryId)
        : [...prevCategories, categoryId];

      handleFilterChange(newCategories, sortByPrice);
      return newCategories;
    });
  };

  const selectByPriceHandler = (selectedValue) => {
    setSortByPrice(selectedValue);
    handleFilterChange(selectedCategories, selectedValue);
  };

  return (
    <div className="w-full md:w-[20%]">
      <div>
        <h1 className="font-semibold mb-2">SORT BY PRICE</h1>
        <Select onValueChange={selectByPriceHandler} value={sortByPrice}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder="Default" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="low">Price: Low to High</SelectItem>
                    <SelectItem value="high">Price: High to Low</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
      </div>

      <Separator className="my-4" />
      
      <div>
        <h1 className="font-semibold mb-2">CATEGORY</h1>
        {categoriesLoading ? (
          <p>Loading filters...</p>
        ) : (
          categoriesData?.categories.map((category) => (
            <div key={category._id} className="flex items-center space-x-2 my-2">
              <Checkbox
                id={category.name}
                onCheckedChange={() => handleCategoryChange(category.name)}
              />
              <Label
                htmlFor={category.name}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {category.name}
              </Label>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Filter;
