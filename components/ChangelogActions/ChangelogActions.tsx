"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button'
import { Edit, MoreVertical, Trash2 } from 'lucide-react'
import { UpsertChangelog } from '../UpsertChangelog/UpsertChangelog'
import { ChangelogEntry } from '../ChangelogList/ChangelogList'
import { useState } from "react";
import { DeleteChangelog } from "../DeleteChangelog/DeleteChangelog";
import { useProjectPermission } from "@/contexts/ProjectPermissionProvider";

export const ChangelogActions = ({ entry, userId }: { entry: ChangelogEntry, userId: string }) => {
  const [openEditChangelog, setOpenEditChangelog] = useState(false)
  const [openDeleteChangelog, setOpenDeleteChangelog] = useState(false)
  const { getPermission } = useProjectPermission()
  const permit = getPermission()

  const isOwner = entry.user?.id === userId;

  const canEdit = isOwner || permit.editChangelog
  const canDelete = isOwner || permit.deleteChangelog

  if (!canEdit && !canDelete) return null;

  return (
    <> <div className="absolute right-3 top-1/2 -translate-y-1/2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem disabled={!canEdit} onClick={() => setOpenEditChangelog(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            disabled={!canDelete}
            onClick={() => setOpenDeleteChangelog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
      <UpsertChangelog
        editingEntry={entry}
        projectId={entry.projectId}
        openEditChangelog={openEditChangelog}
        setOpenEditChangelogAction={setOpenEditChangelog}
        userId={userId}
      />
      <DeleteChangelog
        id={entry.id}
        projectId={entry.projectId}
        open={openDeleteChangelog}
        onOpenAction={setOpenDeleteChangelog}
      />
    </>
  )
}
