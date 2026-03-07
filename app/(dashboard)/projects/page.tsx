import { auth } from "@/lib/auth";
import { redirect } from 'next/navigation'
import { headers } from "next/headers";
import { databaseDrizzle } from "@/db";
import { Navbar } from "@/components/Navbar/Navbar";
import * as motion from "motion/react-client"
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, FolderKanban } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { UpsertProject } from "@/components/UpsertProject/UpsertProject";
import { DeleteProject } from "@/components/DeleteProject/DeleteProject";
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default async function page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user.id) return redirect("/signin")
  const { name, email, image } = session.user

  const userProjects = await databaseDrizzle.query.usersProjects.findMany({
    where: (up, ops) => ops.eq(up.userId, session.user.id),
    columns: {
      role: true,

    },
    with: {
      project: true
    }
  })

  if (!userProjects) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8"
        data-testid="projects-loading"
      >
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </motion.div>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };


  return (
    <div className="w-full">
      <Navbar name={name} email={email} image={image ?? undefined} />
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8"
      >

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground">Projects</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your feedback boards and roadmap projects
            </p>
          </div>
          <UpsertProject />
        </div>

        {/* Empty State */}
        {userProjects.length === 0 ? (
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-16 mt-6"
            data-testid="no-projects"
          >
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/30">
              <FolderKanban className="h-8 w-8 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">No projects yet</h3>
            <p className="mb-6 max-w-sm text-center text-sm text-muted-foreground">
              Create your first project to start collecting feedback from your users.
            </p>
            <UpsertProject title="Create Your First Project" />
          </motion.div>
        ) : (
          /* Project Grid */
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6"
          >
            {userProjects.map(({ project, role }) => (
              <motion.div key={project.id} variants={itemVariants}>
                <Card
                  className="group relative cursor-pointer overflow-hidden transition-all duration-300 hover:border-teal-500/50 hover:shadow-lg"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center justify-center gap-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 dark:bg-emerald-900/30">
                          <FolderKanban className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <Badge
                          variant={role === "ADMIN" ? "default" : "outline"}
                          className={role === "ADMIN" ? "bg-emerald-600 capitalize" : "capitalize"}
                        >
                          {role.toLowerCase()}
                        </Badge>
                      </div>
                      {role === 'ADMIN' && (<div className="flex gap-1">
                        <UpsertProject projectData={project} />
                        <DeleteProject id={project.id} />
                      </div>)}
                    </div>
                    <Link href={`/projects/${project.id}`}>
                      <CardTitle className="mt-3 line-clamp-1 text-lg">{project.name}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {project.description || "No Description"}
                      </CardDescription>
                    </Link>
                  </CardHeader>
                  <Link href={`/projects/${project.id}`}>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm">
                        <span className="rounded bg-muted px-2 py-1 font-mono text-xs">
                          {project.id}
                        </span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                    </CardContent>
                  </Link>
                </Card>

              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
