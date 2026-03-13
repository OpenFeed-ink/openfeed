"use client";
import { useState, useTransition } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowUp, Loader2, Sparkles } from "lucide-react";
import { checkFeatureSimilar, upsertFeaturesAction } from "@/actions/features";
import { toast } from "sonner";
import { TagSelector } from "@/components/TagSelector/TagSelector";
import { tag } from "@/db/schema";
import { EMPTY_FORM_STATE } from "@/lib/zodErrorHandle";
import { Author } from "@/type";

type Tag = typeof tag.$inferSelect;

type Feature = {
  id: string;
  description: string | null;
  status: "under_review" | "planned" | "in_progress" | "done" | "closed";
  title: string;
  upvotesCount: number;
};

export function NewFeatureRequest({ projectId, tags, user }: { projectId: string, tags: Tag[], user: Author }) {
  const [submitPending, startSubmitTransition] = useTransition();
  const [similarPending, startSimilarTransition] = useTransition();
  const [similarFeatures, setSimilarFeatures] = useState<Feature[]>([]);

  const [featureForm, setFeatureForm] = useState({
    title: "",
    description: "",
    status: "under_review",
    selectedTags: [] as Tag[],
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
    form.set("userId", user.id)
    form.set("userName", user.name)
    form.set("isAnonymous", "TRUE")

    startSubmitTransition(async () => {
      const result = await upsertFeaturesAction(EMPTY_FORM_STATE, form);
      if (result.status === "ERROR") {
        toast.error(result.message);
      }
      if (result.status === "SUCCESS") {
        resetForm()
        handleCloseNewFeature(false)
        toast.success(result.message);
      }
    });
  };

  const resetForm = () => {
    setFeatureForm({
      title: "",
      description: "",
      status: "under_review",
      selectedTags: [],
    });
    setSimilarFeatures([]);
  };


  const handleCloseNewFeature = (open: boolean) => {
    window.parent.postMessage({
      type: "openfeed:open-new-feature",
      open
    }, "*")
  }

  return (
    <div className="w-full py-8 px-4">
      <div className="space-y-2 mb-6">
        <h1 className="text-xl font-semibold">
          Create New Feature Request
        </h1>
        <p className="text-sm text-muted-foreground">
          Add a new feature request or feedback item.
        </p>
      </div>

      <div className="space-y-4">
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

        {/* Tags */}
        {tags.length > 0 && <TagSelector
          projectId={projectId}
          selectedTags={featureForm.selectedTags}
          handleSelectTag={handleSelectTag}
          availableTags={tags}
          addNewTag={false}
        />}
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button
          disabled={submitPending}
          onClick={submitFeature}
          className="bg-teal-600 hover:bg-teal-700"
        >
          {submitPending ? "Saving..." : "Create Feature"}
        </Button>
      </div>
    </div>
  );
}

