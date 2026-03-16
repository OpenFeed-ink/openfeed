"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { changelogs } from '@/db/schema'
import { categoryConfig } from '@/type'
import { RichTextEditor } from '../TiptapInput/TiptapInput'
import { Button } from '@/components/ui/button'
import { Edit, Loader2, Plus } from 'lucide-react'
import { useState, useTransition } from 'react';
import { upsertChangeLogAction } from '@/actions/changelog';
import { EMPTY_FORM_STATE } from '@/lib/zodErrorHandle';
import { toast } from 'sonner';

export const UpsertChangelog = ({ editingEntry, projectId }: { editingEntry?: typeof changelogs.$inferSelect, projectId: string }) => {
  const [pending, startTransition] = useTransition()
  const [open, setOpent] = useState(false)
  const [entry, setEntry] = useState({
    title: editingEntry?.title ?? "",
    content: editingEntry?.content ?? "",
    category: editingEntry?.category ?? "new_feature",
  });

  const handleSubmit = () => {
    const form = new FormData();
    form.set("projectId", projectId)
    editingEntry && form.set("id", editingEntry.id)
    form.set("title", entry.title)
    form.set("content", entry.content)
    form.set("category", entry.category)

    startTransition(async () => {
      const resp = await upsertChangeLogAction(EMPTY_FORM_STATE, form)
      if (resp.status === 'ERROR') {
        toast.error(resp.message)
        return;
      }
      if (resp.status === 'SUCCESS') {
        toast.success(resp.message)
        setOpent(false)
        return;
      }
    })
  }


  return (
    <Dialog open={open} onOpenChange={setOpent}>
      <DialogTrigger asChild>
        {editingEntry ? (
          <Button variant="ghost" size="icon" className="cursor-pointer">
            <Edit className="h-4 w-4 text-muted-foreground hover:text-teal-600" />
          </Button>
        ) : (
          <Button size="lg" className="cursor-pointer bg-teal-600 hover:bg-teal-700">
            <Plus className="mr-2 h-4 w-4" />
            New Changelog
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="min-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingEntry ? 'Edit Entry' : 'New Changelog Entry'}</DialogTitle>
          <DialogDescription>
            {editingEntry ? 'Update your changelog entry' : 'Create a new changelog entry'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="What's new?"
                value={entry.title}
                disabled={pending}
                onChange={e => setEntry(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                disabled={pending}
                value={entry.category}
                onValueChange={(value) => setEntry(prev => ({ ...prev, category: value as keyof typeof categoryConfig }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryConfig).map(([key, cfg]) => (
                    <SelectItem key={key} value={key}>
                      <span className="flex items-center gap-2">
                        <cfg.icon className="h-4 w-4" />
                        {cfg.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Content</Label>
            <RichTextEditor
              disable={pending}
              initialContent={entry.content}
              placeholder="Write your changelog entry..."
              onChange={content => setEntry(prev => ({ ...prev, content }))}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button disabled={pending} variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            className="bg-teal-600 hover:bg-teal-700"
            onClick={handleSubmit}
          >
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : editingEntry ? (
              'Update'
            ) : (
              'Create'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
