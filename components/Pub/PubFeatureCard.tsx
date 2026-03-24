import { Card, CardDescription, CardFooter, CardTitle } from "@/components/ui/card";
import { FeatureHeaderCard } from "./FeatureHeaderCard";
import { Badge } from "@/components/ui/badge";
import { statusColors, statusLabels } from "@/type";
import { MessageSquare, ThumbsUp } from "lucide-react";
import { FormatDistanceToNow } from "../FromatDistanceToNow/FormatDistanceToNow";
type PubFeatureCard = {
  id: string;
  createdAt: Date;
  description: string | null;
  title: string;
  status: "under_review" | "planned" | "in_progress" | "done" | "closed";
  upvotesCount: number;
  comments: {
    id: string;
  }[];
  tags: {
    tag: {
      id: string;
      name: string;
      createdAt: Date;
      projectId: string;
      color: string;
    };
  }[];
}
export const PubFeatureCard = ({ feature }: { feature: PubFeatureCard }) => {
  return (
    <Card key={feature.id} className="hover:border-emerald-500/40 hover:shadow-sm transition">
      <FeatureHeaderCard featureId={feature.id}>
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
        {feature.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {feature.tags.map(({ tag }) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="text-[10px] px-1 py-0"
                style={{ borderColor: tag.color }}
              >
                <div
                  className="h-1 w-1 rounded-full mr-1"
                  style={{ backgroundColor: tag.color }}
                />
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </FeatureHeaderCard>
      <CardFooter className="p-4 pt-2 text-xs text-muted-foreground">
        <div className="flex justify-between w-full">
          <div className="flex gap-3">
            <span className="flex gap-1 items-center">
              {feature.upvotesCount || 0}
              <ThumbsUp className="h-3 w-3" />
            </span>
            <span className="flex gap-1 items-center">
              <MessageSquare className="h-3 w-3" />
              {feature.comments.length || 0}
            </span>
          </div>
          <span>
            <FormatDistanceToNow createdAt={feature.createdAt} />
          </span>
        </div>
      </CardFooter>
    </Card>
  )
}
