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
