"use server";
import { databaseDrizzle } from "@/db";
import { widgetConfig } from "@/db/schema";
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
})

export async function saveWidgetConfigAction(_: FormState, formData: FormData) {
  try {
    const config = formData.get("config")
    const projectId = formData.get("projectId")
    const conf = configSchema.parse(JSON.parse(config as string ?? "{}"))
    const newConfig: typeof widgetConfig.$inferSelect = {
      theme: conf.theme,
      projectId: projectId as string,
      widgetName: conf.widgetName,
      info: conf.info,
      triggerBtn_position: conf.triggerBtn.position,
      triggerBtn_icon: conf.triggerBtn.icon,
      triggerBtn_color: conf.triggerBtn.color,
      triggerBtn_textColor: conf.triggerBtn.textColor,
      triggerBtn_size: conf.triggerBtn.size,
      triggerBtn_text: conf.triggerBtn.text,
      showRoadmap: conf.showRoadmap,
      showFeedback: conf.showFeedback,
      showChangeLog: conf.showChangeLog,
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
