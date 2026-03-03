"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";

interface FeedbackFiltersProps {
  currentStatus: string;
  currentSort: string;
  currentSearch: string;
}

export function FeatureFilters({
  currentStatus,
  currentSort,
  currentSearch,
}: FeedbackFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateFilters = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    // Reset to first page when filters change
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  const handleSearch = useDebouncedCallback((value: string) => {
    updateFilters({ q: value });
  }, 300);

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-50">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search feedback..."
          defaultValue={currentSearch}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      <Select
        value={currentStatus}
        onValueChange={(value) => updateFilters({ status: value })}
      >
        <SelectTrigger className="w-35">
          <Filter className="mr-2 h-4 w-4" />
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="under_review">Under Review</SelectItem>
          <SelectItem value="planned">Planned</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="done">Done</SelectItem>
          <SelectItem value="closed">Closed</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={currentSort}
        onValueChange={(value) => updateFilters({ sort: value })}
      >
        <SelectTrigger className="w-35">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="most-votes">Most upvotes</SelectItem>
          <SelectItem value="least-votes">Least upvotes</SelectItem>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="oldest">Oldest</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
