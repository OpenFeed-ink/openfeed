"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { AddNewTag } from "./AddNewTag";
import { tag } from "@/db/schema";

type Tag = typeof tag.$inferSelect

interface TagSelectorProps {
  projectId: string;
  selectedTags: Tag[];
  handleSelectTag: (tag: Tag) => void;
  availableTags: Tag[];
}

export function TagSelector({
  projectId,
  selectedTags,
  handleSelectTag,
  availableTags,
}: TagSelectorProps) {

  return (
    <div className="space-y-3">
      <Label>Tags</Label>
      {/* Selected tags */}
      <div className="flex flex-wrap gap-2">
        {selectedTags.map((tag) => (
          <Button
            key={tag.id}
            type="button"
            variant="outline"
            onClick={() => handleSelectTag(tag)}
            size="sm"
            className="h-7 gap-1 border-dashed cursor-pointer"
            style={{ borderColor: tag.color }}
          >
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: tag.color }} />
            {tag.name}
            <span
              className="ml-1 hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </span>
          </Button>
        ))}
        <AddNewTag projectId={projectId} />
      </div>

      {/* Available tags as selectable badges */}
      {availableTags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {availableTags.map((tag) => {
            const isSelected = selectedTags.some((t) => t.id === tag.id);
            return (
              <Badge
                key={tag.id}
                variant={isSelected ? "default" : "outline"}
                className={`cursor-pointer gap-1 ${isSelected ? "bg-emerald-600 hover:bg-emerald-700" : "hover:bg-accent"
                  }`}
                style={!isSelected ? { borderColor: tag.color } : {}}
                onClick={() => handleSelectTag(tag)}
              >
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: isSelected ? "white" : tag.color }}
                />
                {tag.name}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
