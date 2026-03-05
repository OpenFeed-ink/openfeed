"use client";

import { useState, useTransition } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowUp, Edit, Loader2, Plus, Sparkles } from "lucide-react";
import { checkFeatureSimilar, upsertFeaturesAction } from "@/actions/features";
import { toast } from "sonner";
import { TagSelector } from "../TagSelector/TagSelector";
import { QFeature } from "@/app/(dashboard)/projects/[id]/feature-requests/page";
import { tag } from "@/db/schema";
import { EMPTY_FORM_STATE } from "@/lib/zodErrorHandle";

type Tag = typeof tag.$inferSelect;

type Feature = {
  id: string;
  description: string | null;
  status: "under_review" | "planned" | "in_progress" | "done" | "closed";
  title: string;
  upvotesCount: number;
};

interface UpsertFeatureProps {
  projectId: string;
  feature?: QFeature;
  availableTags: Tag[];
}

export function UpsertFeature({ projectId, feature, availableTags }: UpsertFeatureProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitPending, startSubmitTransition] = useTransition();
  const [similarPending, startSimilarTransition] = useTransition();
  const [similarFeatures, setSimilarFeatures] = useState<Feature[]>([]);

  const [featureForm, setFeatureForm] = useState({
    title: feature?.title ?? "",
    description: feature?.description ?? "",
    status: feature?.status ?? "under_review",
    selectedTags: feature?.tags?.map(t => t.tag) ?? [],
  });

  const debouncedSearch = useDebouncedCallback(async (title: string) => {
    if (title.length < 3) {
      setSimilarFeatures([]);
      return;
    }
    const form = new FormData();
    form.set("projectId", projectId);
    form.set("title", title);

    startSimilarTransition(async () => {
      const { restult, status, message } = await checkFeatureSimilar(EMPTY_FORM_STATE, form);
      if (status === "ERROR") {
        toast.error(message);
        return;
      }
      if (status === "SUCCESS" && restult) {
        setSimilarFeatures(restult);
      }
    });
  }, 500);

  const handleTitleChange = (newTitle: string) => {
    setFeatureForm(prv => ({ ...prv, title: newTitle }));
    debouncedSearch(newTitle);
  };

  const handleSelectTag = (tag: Tag) => {
    setFeatureForm(prv => {
      const selectedTag = prv.selectedTags.find(t => t.id === tag.id);
      if (selectedTag) return { ...prv, selectedTags: prv.selectedTags.filter(t => t.id !== tag.id) };
      return { ...prv, selectedTags: [...prv.selectedTags, tag] };
    });
  };

  const submitFeature = () => {
    const form = new FormData();
    form.set("title", featureForm.title);
    form.set("description", featureForm.description);
    form.set("status", featureForm.status);
    featureForm.selectedTags.forEach((tag) => form.append("tagIds", tag.id));
    form.set("projectId", projectId);
    if (feature) form.set("id", feature.id);

    startSubmitTransition(async () => {
      const result = await upsertFeaturesAction(EMPTY_FORM_STATE, form);
      if (result.status === "ERROR") {
        toast.error(result.message);
      }
      if (result.status === "SUCCESS") {
        toast.success(result.message);
        setOpen(false);
      }
    });
  };

  const resetForm = () => {
    setFeatureForm({
      title: feature?.title ?? "",
      description: feature?.description ?? "",
      status: feature?.status ?? "under_review",
      selectedTags: feature?.tags?.map(t => t.tag) ?? [],
    });
    setSimilarFeatures([]);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) resetForm();
      }}
    >
      <DialogTrigger asChild>
        {feature ? (
          <Button variant="ghost" size="icon" className="cursor-pointer">
            <Edit className="h-4 w-4 text-muted-foreground hover:text-teal-600" />
          </Button>
        ) : (
          <Button size="lg" className="cursor-pointer bg-teal-600 hover:bg-teal-700">
            <Plus className="mr-2 h-4 w-4" />
            New Feature
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {feature ? "Edit Feature Request" : "Create New Feature Request"}
          </DialogTitle>
          <DialogDescription>
            {feature
              ? "Update your feature request details below."
              : "Add a new feature request or feedback item."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title input */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Feature title"
              value={featureForm.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              minLength={5}
            />
          </div>

          {/* Loading indicator for similarity check */}
          {similarPending && (
            <p className="font-medium text-yellow-800 dark:text-yellow-400 flex items-center gap-1 mb-3">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking similar feature requests...
            </p>
          )}

          {/* Similar features cards - scrollable if many */}
          {similarFeatures.length > 0 && (
            <div className="rounded-md bg-yellow-50 dark:bg-yellow-950/30 p-3">
              <p className="font-medium text-yellow-800 dark:text-yellow-400 flex items-center gap-1 mb-3">
                <Sparkles className="h-4 w-4" />
                Similar existing requests:
              </p>
              <div className="max-h-40 overflow-y-auto pr-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {similarFeatures.map((f) => (
                    <div
                      key={f.id}
                      onClick={() => {
                        setOpen(false);
                        router.push(`/projects/${projectId}/feature-requests?featureId=${f.id}`);
                      }}
                      className="cursor-pointer"
                    >
                      <Card className="text-left p-3 rounded-lg border border-yellow-200 dark:border-yellow-800 hover:border-teal-500 hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-teal-500">
                        <div className="font-medium text-sm line-clamp-1">{f.title}</div>
                        {f.description && (
                          <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {f.description}
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline" className="text-xs">
                            {f.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                            <ArrowUp className="h-3 w-3" />
                            {f.upvotesCount}
                          </span>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe the feature..."
              value={featureForm.description}
              onChange={(e) => setFeatureForm(prv => ({ ...prv, description: e.target.value }))}
              rows={4}
              className="max-h-32"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Initial Status</Label>
            <Select
              name="status"
              value={featureForm.status}
              onValueChange={(status) =>
                setFeatureForm(prv => ({
                  ...prv,
                  status: status as "under_review" | "planned" | "in_progress" | "done" | "closed",
                }))
              }
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <TagSelector
            projectId={projectId}
            selectedTags={featureForm.selectedTags}
            handleSelectTag={handleSelectTag}
            availableTags={availableTags}
          />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            disabled={submitPending}
            onClick={submitFeature}
            className="bg-teal-600 hover:bg-teal-700"
          >
            {submitPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {feature ? "Updating..." : "Creating..."}
              </>
            ) : feature ? (
              "Update Feature"
            ) : (
              "Create Feature"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
