import React from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Calendar } from "lucide-react";
import { Category } from './CoursesTypes';

interface CoursesFilterProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  filteredCoursesLength: number;
  coursesLength: number;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  categories: Category[];
  selectedLevel: string;
  setSelectedLevel: (val: string) => void;
  selectedLanguage: string;
  setSelectedLanguage: (val: string) => void;
  uniqueLanguages: string[];
  selectedStatus: string;
  setSelectedStatus: (val: string) => void;
  selectedDate: string;
  setSelectedDate: (val: string) => void;
  handleApplyFilters: () => void;
}

const CoursesFilter: React.FC<CoursesFilterProps> = ({
  searchTerm, setSearchTerm, filteredCoursesLength, coursesLength,
  selectedCategory, setSelectedCategory, categories,
  selectedLevel, setSelectedLevel,
  selectedLanguage, setSelectedLanguage, uniqueLanguages,
  selectedStatus, setSelectedStatus,
  selectedDate, setSelectedDate,
  handleApplyFilters
}) => {
  return (
    <div className="bg-white rounded-[22px] shadow-[0_16px_36px_-12px_rgba(0,0,0,0.06)] border-[1.35px] border-[#E5E7EB] p-4 sm:p-6 lg:p-7">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-12 gap-4">
        <div className="relative sm:col-span-2 md:col-span-3 lg:col-span-3 xl:col-span-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5 z-[1]" />
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            maxLength={25}
            onChange={(e) => setSearchTerm(e.target.value.replace(/[^a-zA-Z\s]/g, ""))}
            className="pl-11 h-11 bg-[#F8FAFC] border-[1.35px] border-[#E5E7EB] rounded-[14px] text-[13px] text-gray-700 placeholder-slate-400/90 focus:border-purple-500/80 focus:ring-0 focus-visible:ring-0 cursor-text relative"
          />
          {searchTerm && filteredCoursesLength === 0 && (
            <div className="absolute top-[calc(100%+6px)] left-0 w-full bg-white border-[1.35px] border-[#E5E7EB] rounded-[14px] shadow-md py-4 z-10 text-center animate-in fade-in slide-in-from-top-2 duration-200">
              <span className="text-[14px] text-[#64748B] font-medium tracking-wide">No results found</span>
            </div>
          )}
        </div>

        <div className="xl:col-span-3 lg:col-span-1">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full h-11 bg-[#F8FAFC] border-[1.35px] border-[#E5E7EB] rounded-[14px] text-[13px] font-medium text-gray-700 cursor-pointer px-2 sm:px-2.5">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={String(cat.id)}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="xl:col-span-3 lg:col-span-1">
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-full h-11 bg-[#F8FAFC] font-medium border-[1.35px] border-[#E5E7EB] rounded-[14px] text-[13px] text-gray-700 cursor-pointer">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
              <SelectItem value="midlevel">Midlevel</SelectItem>
              <SelectItem value="basic">Basic</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="xl:col-span-3 lg:col-span-1">
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-full h-11 bg-[#F8FAFC] font-medium border-[1.35px] border-[#E5E7EB] rounded-[14px] text-[13px] tracking-tight text-gray-800 cursor-pointer px-2 sm:px-2">
              <SelectValue placeholder="All Programming Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Programming Language</SelectItem>
              {uniqueLanguages.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="xl:col-span-3 lg:col-span-1">
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full h-11 bg-[#F8FAFC] font-medium border-[1.35px] border-[#E5E7EB] rounded-[14px] text-[13px] text-gray-700 cursor-pointer">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="xl:col-span-3 lg:col-span-1 relative w-full">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-11 bg-[#F8FAFC] border-[1.35px] border-[#E5E7EB] rounded-[14px] font-medium pr-10 text-[13px] text-gray-700 cursor-pointer"
          />
          <button
            type="button"
            onClick={(e) => {
              const wrapper = e.currentTarget.parentElement as HTMLElement | null;
              const input = wrapper?.querySelector('input') as HTMLInputElement | null;
              if (!input) return;
              const anyInput = input as HTMLInputElement & { showPicker?: () => void };
              if (typeof anyInput.showPicker === "function") anyInput.showPicker();
              input.focus();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
          >
            <Calendar className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="xl:col-span-3 lg:col-span-1">
          <Button onClick={handleApplyFilters} className="w-full h-11 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-[13px] rounded-[14px] whitespace-nowrap shadow-[0_4px_14px_rgba(99,102,241,0.25)] transition-all cursor-pointer">
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CoursesFilter;
