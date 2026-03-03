"use client";
import { useActionState, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
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
import { Plus, Loader2, Edit } from "lucide-react";
import { toast } from "sonner";
import { feature } from "@/db/schema";
import { useFormStatus } from "react-dom";
import { upsertFeaturesAction } from "@/actions/features";
import { EMPTY_FORM_STATE } from "@/lib/zodErrorHandle";

interface CreateFeatureDialogProps {
  projectId: string;
  feature?: typeof feature.$inferSelect,
}

export function UpsertFeature({ projectId, feature }: CreateFeatureDialogProps) {
  const [state, formAction] = useActionState(upsertFeaturesAction, EMPTY_FORM_STATE);
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (state.status === "ERROR") {
      toast.error(state.message);
      return;
    }
    if (state.status === "SUCCESS") {
      setOpen(false)
      toast.success(state.message)
      return;
    }
  }, [state]);



  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {feature ? <Button
          variant="ghost"
          size="icon"
          className="cursor-pointer"
        >
          <Edit className="h-4 w-4 text-muted-foreground hover:text-teal-600" />
        </Button> :
          <Button size="lg" className="cursor-pointer">
            <Plus className="mr-2 h-4 w-4" />
            New Feature
          </Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>
            {feature ? "Edit Feature Request" : "Create New Feature Request"}
          </DialogTitle>
          <DialogDescription>
            {feature ? "Update your feature request details below."
              : "Add a new feature request or feedback item."}
          </DialogDescription>
        </DialogHeader>
        <form action={(data) => {
          data.set("projectId", projectId);
          feature && data.set("id", feature.id);
          formAction(data)
        }}>
          <FeatureForm newFeature={feature} />
        </form>
      </DialogContent>
    </Dialog>
  );
}

const FeatureForm = ({ newFeature }: { newFeature?: typeof feature.$inferSelect }) => {
  const { pending } = useFormStatus();
  return (
    <>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            name="title"
            placeholder="Feature title"
            defaultValue={newFeature?.title}
            required
            min={5}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            name="description"
            placeholder="Describe the feature..."
            defaultValue={newFeature?.description ?? undefined}
            rows={4}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Initial Status</Label>
          <Select
            name="status"
            defaultValue={newFeature?.status ?? 'under_review'}
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
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </DialogClose>

        <Button disabled={pending} type="submit">
          {pending ? (
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
    </>
  )
}
