"use server";
import { databaseDrizzle } from "@/db";
import { widgetConfig } from "@/db/schema";
import { getProjectUserPermission } from "@/lib/permission/getProjectPermission";
import { getServerSession } from "@/lib/server/session";
import { fromErrorToFormState, FormState, toFormState } from "@/lib/zodErrorHandle";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const configSchema = z.object({
  theme: z.enum(["dark", "light", "system"]),
  widgetName: z.string().min(3).max(50),
  info: z.string().max(255).nullable(),
  triggerBtn: z.object({
    position: z.enum([
      "float-bottom-right",
      "float-bottom-left",
      "float-up-right",
      "float-up-left",
      "drawer-left",
      "drawer-right"]),
    color: z.string(),
    textColor: z.string(),
    size: z.enum(["default", "xs", "sm", "lg", "icon", "icon-xs", "icon-sm", "icon-lg"]),
    text: z.string().nullable(),
    icon: z.string().nullable(),
  }),
  showFeedback: z.boolean(),
  showChangeLog: z.boolean(),
  showRoadmap: z.boolean(),
  announcement: z.object({
    position: z.enum(['top', 'bottom']),
    text: z.string(),
    link: z.string().optional(),
    dismiss: z.boolean(),
    bgcolor: z.string(),
    textcolor: z.string(),
    actionBtn: z.string(),
  }).optional().nullable()
})

export async function saveWidgetConfigAction(_: FormState, formData: FormData) {
  try {
    const session = await getServerSession()
    if (!session?.user.id) throw new Error("Unauthorized");

    const { projectId, conf } = z.object({
      projectId: z.string().min(5),
      conf: configSchema
    }).parse({
      projectId: formData.get("projectId"),
      conf: JSON.parse(formData.get("config") as string ?? "{}")
    })

    const { role } = await getProjectUserPermission(session.user.id, projectId)
    if (role === 'anonymous') throw new Error("you don't have permission to update widget config")

    const newConfig: typeof widgetConfig.$inferSelect = {
      theme: conf.theme,
      projectId: projectId,
      widgetName: conf.widgetName,
      info: conf.info,
      triggerBtn: conf.triggerBtn,
      showRoadmap: conf.showRoadmap,
      showFeedback: conf.showFeedback,
      showChangeLog: conf.showChangeLog,
      announcement: conf.announcement ?? null
    }

    await databaseDrizzle.insert(widgetConfig)
      .values(newConfig)
      .onConflictDoUpdate({ target: [widgetConfig.projectId], set: newConfig })

    revalidatePath(`/projects/${projectId}/widget-builder`);
    return toFormState("SUCCESS", "Your widget config has been updated");

  } catch (e) {
    return fromErrorToFormState(e)
  }
}
