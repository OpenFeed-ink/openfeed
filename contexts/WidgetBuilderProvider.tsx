"use client";
import { createContext, useContext, useState, useTransition } from "react";
import type { Config } from "@/type"
import { saveWidgetConfigAction } from "@/actions/widgets";
import { EMPTY_FORM_STATE } from "@/lib/zodErrorHandle";
import { toast } from "sonner";
import { z } from "zod";


const announcementSchema = z.object({
  text: z
    .string()
    .min(5, "Make it a bit more descriptive (min 5 characters)"),
  actionBtn: z
    .string()
    .min(2, "Make it a bit more descriptive (min 2 characters)"),
})

export const configSchema = z.object({
  announcement: announcementSchema.optional(),
})

type WidgetBuilderContextType = {
  projectId:string;
  config: Config;
  pending: boolean;
  errors: {
    announcementText?: string;
    actionBtn?: string;
  },
  setConfig: (config: Config) => void;
  saveConfig: () => Promise<void>
};

const WidgetBuilderContext = createContext<WidgetBuilderContextType | null>(null);

export function WidgetBuilderProvider({
  projectId,
  children,
  orginalConfig,
}: {
  projectId: string,
  orginalConfig: Config
  children: React.ReactNode;
}) {
  const [pending, startTransition] = useTransition()
  const [errors, setErrors] = useState<{ announcementText?: string; actionBtn?: string }>({})
  const [config, setConf] = useState<Config>(orginalConfig)

  const setConfig = (config: Config) => setConf(config)

  const saveConfig = async () => {
    const form = new FormData()
    form.set('projectId', projectId)
    const result = configSchema.safeParse(config)

    if (!result.success) {
      const fieldErrors = z.treeifyError(result.error).properties
      setErrors({
        announcementText: (fieldErrors?.announcement as any).properties?.text?.errors?.[0],
        actionBtn: (fieldErrors?.announcement as any).properties?.actionBtn?.errors?.[0],
      })

      toast.error("Please fix the errors before saving")
      return
    }
    setErrors({})
    startTransition(async () => {
      form.set("config", JSON.stringify(config))
      const resp = await saveWidgetConfigAction(EMPTY_FORM_STATE, form)
      if (resp.status === 'ERROR') {
        toast.error(resp.message)
        return;
      }
      if (resp.status === 'SUCCESS') {
        toast.success(resp.message)
      }
    })
  }


  return (
    <WidgetBuilderContext.Provider
      value={{
        config,
        projectId,
        pending,
        setConfig,
        saveConfig,
        errors,
      }}
    >
      {children}
    </WidgetBuilderContext.Provider>
  );
}

export function useWidgetBuilder() {
  const ctx = useContext(WidgetBuilderContext);

  if (!ctx) {
    throw new Error("useWidgetBuilder must be used inside WidgetBuilderProvider");
  }

  return ctx;
}
