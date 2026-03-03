"use client";

import * as motion from "motion/react-client";
import { useRouter, useSearchParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { QFeature } from "@/app/(dashboard)/projects/[id]/feature-requests/page";
import { UpvoteButton } from "../UpvoteButton/UpvoteButton";


interface FeatureListProps {
  features: QFeature[];
  totalPages: number;
  currentPage: number;
  selectedFeatureId?: string;
}

const statusLabels: Record<QFeature["status"], string> = {
  under_review: "Under Review",
  planned: "Planned",
  in_progress: "In Progress",
  done: "Done",
  closed: "Closed",
};

const statusColors: Record<QFeature["status"], string> = {
  under_review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  planned: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  in_progress: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  done: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};

export function FeatureList({ features, totalPages, currentPage, selectedFeatureId }: FeatureListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSelect = (featureId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("featureId", featureId);
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };


  return (
    <div className="space-y-4">
      <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-2">
        {features.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No feedback found</p>
          </Card>
        ) : (
          features.map((feature) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card
                className={`cursor-pointer m-4 transition-all hover:border-teal-500/50 hover:shadow-md ${selectedFeatureId === feature.id
                  ? "border-teal-500 ring-1 ring-teal-500 m-2"
                  : ""
                  }`}
                onClick={() => handleSelect(feature.id)}
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base line-clamp-1">
                      {feature.title}
                    </CardTitle>
                    <Badge className={statusColors[feature.status]}>
                      {statusLabels[feature.status]}
                    </Badge>
                  </div>
                  {feature.description && (
                    <CardDescription className="line-clamp-2 text-sm">
                      {feature.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardFooter className="p-4 pt-2">
                  <div className="flex w-full items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <UpvoteButton
                        projectId={feature.projectId}
                        featureId={feature.id}
                        size="sm"
                      />
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {feature.comments.length}
                      </span>
                    </div>
                    <span>
                      {formatDistanceToNow(new Date(feature.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
