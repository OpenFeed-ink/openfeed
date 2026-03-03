export type UserProject = {
    role: "ADMIN" | "MEMBER";
    project: {
        id: string;
        name: string;
        createdAt: Date;
        description: string | null;
    };
}
