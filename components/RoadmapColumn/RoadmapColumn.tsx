import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Spinner } from "@/components/ui/spinner"
import type { Feature } from "@/type";
import { memo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { RoadmapCard } from "../RoadmapCard/RoadmapCard";

interface RoadmapColumnProps {
  id: string;
  title: string;
  color: string;
  features: Feature[];
  allowed: boolean;
  isHidden: boolean;
  isHiddenLoading: boolean;
  onToggleVisibility: (hide: boolean) => void;
}

export const RoadmapColumn = memo(function RoadmapColumn({
  id,
  title,
  color,
  features,
  allowed,
  isHidden,
  isHiddenLoading,
  onToggleVisibility,
}: RoadmapColumnProps) {

  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className="bg-muted/30 rounded-lg p-3 min-w-72 flex flex-col min-h-100`"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className={`text-sm font-medium px-2 py-1 rounded ${color}`}>{title}</h3>
          {allowed && (<Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-lg"
                disabled={isHiddenLoading}
                onClick={() => onToggleVisibility(!isHidden)}
              >
                {isHiddenLoading ? <Spinner data-icon="inline-start" />
                  : isHidden ? <EyeOff className="h-3 w-3" />
                    : <Eye className="h-3 w-3" />
                }
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isHidden ? "Show on public roadmap" : "Hide from public roadmap"}</p>
            </TooltipContent>
          </Tooltip>)}

        </div>
        <span className="text-xs text-muted-foreground">{features.length}</span>
      </div>
      <SortableContext
        id={id}
        items={features.map((f) => f.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-2 flex-1">
          {features.map((feature) => (
            <RoadmapCard
              key={feature.id}
              feature={feature}
            />
          ))}
          {features.length === 0 && (
            <div className="border-2 border-dashed border-border rounded-lg flex items-center justify-center text-xs text-muted-foreground py-8">
              Drop here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
})
