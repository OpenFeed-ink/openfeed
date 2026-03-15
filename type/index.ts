import { feature, tag } from "@/db/schema";

export type UserProject = {
  role: "ADMIN" | "MEMBER";
  project: {
    id: string;
    name: string;
    createdAt: Date;
    description: string | null;
  };
}

export type SimilarFeature = {
  id: string;
  title: string;
  description: string | null;
  status: "under_review" | "planned" | "in_progress" | "done" | "closed";
  upvotesCount: number;
}

export type Author = {
  id: string
  name: string
  image: string | null
}

export type CommentNode = {
  id: string
  featureId: string
  content: string
  createdAt: Date
  authorName: string | null
  authorId: string | null
  visitorToken: string | null
  author: Author | null
  parentId: string | null
  replies: CommentNode[]
}

export type Membership = {
  userId: string
  role: "ADMIN" | "MEMBER"
}

export type Config = {
  theme: "dark" | "light" | "system";
  widgetName: string;
  info: string | null;
  triggerBtn: {
    position: "float-bottom-right" | "float-bottom-left" | "float-up-right" | "float-up-left" | "drawer-left" | "drawer-right";
    color: string;
    textColor: string;
    size: "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";
    text: string | null;
    icon: string | null;
  };
  showFeedback: boolean;
  showChangeLog: boolean;
  showRoadmap: boolean;
}

export type Feature = {
  id: string,
  title: string,
  status: typeof feature.$inferSelect['status'],
  description: string | null,
  tags: typeof tag.$inferSelect[],
  upvotesCount: number,
  commentsCount: number,
  createdAt: Date
};

export const statusLabels: Record<typeof feature.$inferSelect["status"], string> = {
  under_review: "Under Review",
  planned: "Planned",
  in_progress: "In Progress",
  done: "Done",
  closed: "Closed",
};

export const statusColors: Record<typeof feature.$inferSelect["status"], string> = {
  under_review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  planned: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  in_progress: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  done: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
};
