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
  author: Author | null
  parentId: string | null
  replies: CommentNode[]
}

export type Membership = {
  userId: string
  role: "ADMIN" | "MEMBER"
}
