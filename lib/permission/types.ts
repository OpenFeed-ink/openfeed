// lib/permission/types.ts
export type Role = "ADMIN" | "MEMBER" | "ANONYMOUS";

export type Permission = {
  role: "admin" | "member"| "anonymous",
  billing: boolean;
  deleteProject: boolean;
  editFeature: boolean;
  addNewFeature: boolean;
  deleteAnyFeature: boolean;
  generateAiSummary: boolean;
  addComment: boolean;
  deleteComment: boolean;
  canPin: boolean;
  addNewChangelog: boolean;
  editChangelog: boolean;
  deleteChangelog: boolean;
  inviteMember:boolean;
  removeMember:boolean;
};
