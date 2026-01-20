"use client";

import { useMemo, useState } from "react";
import { MyCoursesHeader } from "@/components/student/my-courses-header";
import { MyCoursesFilters } from "@/components/student/my-courses-filters";
import { MyCoursesList } from "@/components/student/my-courses-list";
import { MyCoursesStats } from "@/components/student/my-courses-stats";
import type { StudentCourse } from "@/components/student/types";

interface MyCoursesClientProps {
  courses: StudentCourse[];
}

export function MyCoursesClient({ courses }: MyCoursesClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [modalityFilter, setModalityFilter] = useState<string>("all");

  const filteredCourses = useMemo(() => {
    return courses
      .filter((course) => {
        const searchLower = searchTerm.trim().toLowerCase();
        return (
          course.title.toLowerCase().includes(searchLower) ||
          course.instructorName.toLowerCase().includes(searchLower) ||
          course.category.toLowerCase().includes(searchLower)
        );
      })
      .filter((course) => {
        if (statusFilter === "all") return true;
        return course.status === statusFilter;
      })
      .filter((course) => {
        if (modalityFilter === "all") return true;
        return course.modality === modalityFilter;
      });
  }, [courses, searchTerm, statusFilter, modalityFilter]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setModalityFilter("all");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <MyCoursesHeader />
      <MyCoursesStats courses={courses} />
      <MyCoursesFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        modalityFilter={modalityFilter}
        onModalityChange={setModalityFilter}
        onClear={handleClearFilters}
      />
      <MyCoursesList courses={filteredCourses} onClearFilters={handleClearFilters} />
    </div>
  );
}
