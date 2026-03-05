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
