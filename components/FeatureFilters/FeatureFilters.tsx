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
import { Search, Filter, Tag } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { tag } from "@/db/schema";
import { AddNewTag } from "../TagSelector/AddNewTag";


interface FeedbackFiltersProps {
  projectId: string;
  currentStatus: string;
  currentSort: string;
  currentSearch: string;
  currentTags: string[];
  availableTags: (typeof tag.$inferSelect)[]
}

export function FeatureFilters({
  projectId,
  currentStatus,
  currentSort,
  currentSearch,
  availableTags,
  currentTags = [],
}: FeedbackFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);

  const updateFilters = (updates: Record<string, string | string[]>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          params.set(key, value.join(','));
        } else {
          params.delete(key);
        }
      } else {
        if (value && value !== 'all') {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
    });
    params.delete('page');
    router.push(`?${params.toString()}`);
  };

  const handleSearch = useDebouncedCallback((value: string) => {
    updateFilters({ q: value });
  }, 300);

  const handleTagSelect = (tagId: string) => {
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter(id => id !== tagId)
      : [...currentTags, tagId];
    updateFilters({ tags: newTags });
  };

  const selectedTags = availableTags.filter(tag => currentTags.includes(tag.id));

  return (
    <div>
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
        {/* Tag filter */}
        <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-35 justify-start">
              <Tag className="mr-2 h-4 w-4" />
              {selectedTags.length > 0 ? (
                <span className="flex-1 truncate">
                  {selectedTags.length} tag{selectedTags.length > 1 ? 's' : ''}
                </span>
              ) : (
                <span>All tags</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-0">
            <Command>
              <CommandInput placeholder="Search tags..." />
              <CommandEmpty>
                <p className="pb-2">No tags found.</p>
                <AddNewTag projectId={projectId} title="Create New Tag" />
              </CommandEmpty>

              <CommandGroup className="max-h-64 overflow-y-auto">
                {availableTags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    onSelect={() => handleTagSelect(tag.id)}
                    className="flex items-center gap-2"
                  >
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span>{tag.name}</span>
                    {currentTags.includes(tag.id) && (
                      <span className="ml-auto text-xs text-teal-600">✓</span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Display selected tags as badges */}
      <div className="flex flex-wrap gap-1 items-center p-2">
        {selectedTags.map(tag => (
          <Badge
            key={tag.id}
            variant="outline"
            className="gap-1 pr-1 cursor-pointer"
            style={{ borderColor: tag.color }}
            onClick={() => handleTagSelect(tag.id)}
          >
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: tag.color }} />
            {tag.name}
            <span
              className="ml-1 hover:text-destructive"
            >
              ×
            </span>
          </Badge>
        ))}
      </div>
    </div>
  );
}
