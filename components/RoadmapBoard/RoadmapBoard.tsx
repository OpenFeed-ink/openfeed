"use client";

import { useState, useTransition, useOptimistic, useMemo } from "react";
import {
  DndContext,
  DragStartEvent,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  rectIntersection,
  CollisionDetection,
} from "@dnd-kit/core";

import { statusColors, statusLabels, type Feature } from "@/type";
import { updateFeatureStatus } from "@/actions/features";
import { EMPTY_FORM_STATE } from "@/lib/zodErrorHandle";
import { toast } from "sonner";
import { toggleRoadmapColumn } from "@/actions/projects";
import { RoadmapColumn } from "../RoadmapColumn/RoadmapColumn";
import { RoadmapCard } from "../RoadmapCard/RoadmapCard";

interface RoadmapBoardProps {
  features: Feature[];
  projectId: string;
  userId: string;
  hiddenColumns: string[];
  allowed: boolean;
}

const statuses = [
  { value: "under_review", label: statusLabels["under_review"], color: statusColors["under_review"] },
  { value: "planned", label: statusLabels["planned"], color: statusColors["planned"] },
  { value: "in_progress", label: statusLabels["in_progress"], color: statusColors["in_progress"] },
  { value: "done", label: statusLabels["done"], color: statusColors["done"] },
  { value: "closed", label: statusLabels["closed"], color: statusColors["closed"] },
];

type BoardState = {
  columns: Record<string, string[]>;
  features: Record<string, Feature>;
};


const collisionDetectionStrategy: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) return pointerCollisions;
  return rectIntersection(args);
};

function createBoardState(features: Feature[]): BoardState {
  const columns: Record<string, string[]> = {};
  const featureMap: Record<string, Feature> = {};

  statuses.forEach((s) => (columns[s.value] = []));

  for (const f of features) {
    featureMap[f.id] = f;
    columns[f.status].push(f.id);
  }

  return { columns, features: featureMap };
}


export function RoadmapBoard({
  projectId,
  features,
  hiddenColumns,
  allowed,
}: RoadmapBoardProps) {

  const [activeId, setActiveId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [hidePending, startHiding] = useTransition()
  const [hidenPendingColumn, setHidenPendingColumn] = useState("")

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const [board, updateBoard] = useOptimistic(
    createBoardState(features),
    (
      state,
      action: {
        type: "move";
        id: string;
        from: string;
        to: string;
        overId?: string;
      }
    ) => {
      const next = structuredClone(state);

      const fromColumn = [...next.columns[action.from]];
      const toColumn =
        action.from === action.to
          ? fromColumn
          : [...next.columns[action.to]];

      const oldIndex = fromColumn.indexOf(action.id);

      if (oldIndex !== -1) {
        fromColumn.splice(oldIndex, 1);
      }

      if (action.from === action.to && action.overId) {
        const newIndex = fromColumn.indexOf(action.overId);

        if (!fromColumn.includes(action.id)) {
          fromColumn.splice(newIndex, 0, action.id);
        }

        next.columns[action.from] = fromColumn;
      } else {

        if (!toColumn.includes(action.id)) {
          toColumn.unshift(action.id);
        }

        next.columns[action.from] = fromColumn;
        next.columns[action.to] = toColumn;

        next.features[action.id].status =
          action.to as Feature["status"];
      }

      return next;
    }
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over) return;

    const feature = board.features[active.id as string];
    if (!feature) return;

    const from = feature.status;

    const to =
      over.data.current?.sortable?.containerId ??
      over.id;

    if (!board.columns[to]) return;

    const overId =
      over.data.current?.sortable?.items?.includes(over.id)
        ? (over.id as string)
        : undefined;

    startTransition(async () => {
      updateBoard({
        type: "move",
        id: feature.id,
        from,
        to,
        overId,
      });
      if (from === to) return;
      const formData = new FormData();
      formData.append("featureId", feature.id);
      formData.append("newStatus", to);
      formData.append("projectId", projectId);
      const res = await updateFeatureStatus(EMPTY_FORM_STATE, formData)
      if (res.status === 'ERROR') {
        toast.error(res.message)
      }
    });
  };

  const toggleVisibility = (hide: boolean, status: string) => {
    setHidenPendingColumn(status)
    startHiding(async () => {
      const formData = new FormData();
      formData.set("projectId", projectId);
      formData.append("hide", `${hide}`);
      formData.append("status", status);
      const res = await toggleRoadmapColumn(EMPTY_FORM_STATE, formData)
      if (res.status === 'ERROR') {
        toast.error(res.message)
        return;
      }
      if (res.status === 'SUCCESS') {
        toast.success(res.message)
        return;
      }
    })
  }

  const activeFeature = useMemo(() => activeId ? board.features[activeId] : null, [activeId])

  const columnFeatures = useMemo(() => {
    const map: Record<string, Feature[]> = {};

    for (const status of statuses) {
      map[status.value] = board.columns[status.value].map(
        (id) => board.features[id]
      );
    }

    return map;
  }, [board]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >

      <div className="flex gap-4 overflow-x-auto pb-4">

        {statuses.map((status) => (
          <RoadmapColumn
            key={status.value}
            id={status.value}
            title={status.label}
            color={status.color}
            allowed={allowed}
            isHidden={hiddenColumns.includes(status.value)}
            isHiddenLoading={hidePending && hidenPendingColumn === status.value}
            features={columnFeatures[status.value]}
            onToggleVisibility={(hide) => toggleVisibility(hide, status.value)}
          />
        ))}

      </div>

      <DragOverlay>
        {activeFeature && activeId && (
          <div className="rotate-2 scale-105 shadow-xl">
            <RoadmapCard feature={activeFeature} isDragging />
          </div>
        )}
      </DragOverlay>

    </DndContext>
  );
}
