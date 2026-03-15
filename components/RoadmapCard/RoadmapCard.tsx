"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { MessageSquare, ThumbsUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { statusColors, statusLabels, type Feature } from "@/type";
import { memo } from "react";

interface RoadmapCardProps {
  feature: Feature;
  isDragging?: boolean;
}

export const RoadmapCard = memo(function RoadmapCard({
  feature,
  isDragging,
}: RoadmapCardProps) {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: sortableDragging,
  } = useSortable({
    id: feature.id,
    data: { feature },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || sortableDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="cursor-grab active:cursor-grabbing hover:border-teal-500/50 hover:shadow-md">
        <CardHeader className="p-3 pb-1">
          <div className="flex justify-between">
            <CardTitle className="text-sm line-clamp-1">
              {feature.title}
            </CardTitle>
            <Badge className={statusColors[feature.status]}>
              {statusLabels[feature.status]}
            </Badge>
          </div>
          {feature.description && (
            <CardDescription className="text-xs line-clamp-2">
              {feature.description}
            </CardDescription>
          )}
          {feature.tags && feature.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {feature.tags.map((tag) => (
                <Badge
                  key={`${feature.id}-${tag.id}`}
                  variant="outline" className="text-[10px] px-1 py-0"
                  style={{ borderColor: tag.color }} >
                  <div
                    className="h-1 w-1 rounded-full mr-1"
                    style={{ backgroundColor: tag.color }}
                  /> {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
        <CardFooter className="p-4 pt-2 text-xs text-muted-foreground">
          <div className="flex justify-between w-full">
            <div className="flex gap-3">
              <span className="flex gap-1 items-center">
                {feature.upvotesCount || 0}
                <ThumbsUp className="h-3 w-3" />
              </span>
              <span className="flex gap-1 items-center">
                <MessageSquare className="h-3 w-3" />
                {feature.commentsCount || 0}
              </span>
            </div>
            <span>
              {formatDistanceToNow(
                new Date(feature.createdAt),
                { addSuffix: true }
              )}
            </span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
})
