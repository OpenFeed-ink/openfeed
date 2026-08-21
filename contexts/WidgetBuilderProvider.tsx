"use client";
import { createContext, useCallback, useContext, useMemo, useState, useTransition } from "react";
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

  const saveConfig = useCallback(async () => {
    const form = new FormData()
    form.set('projectId', projectId)
    const result = configSchema.safeParse(config)

    if (!result.success) {
      const fieldErrors = z.treeifyError(result.error).properties
      // treeifyError's type is a union that only sometimes includes `properties`
      // (a leaf node vs. a nested-object node) — narrow it explicitly instead of
      // `as any`, which previously let this crash if announcement's node ever
      // came back as the leaf variant.
      const announcementErrors = fieldErrors?.announcement as
        | { errors: string[]; properties?: { text?: { errors: string[] }; actionBtn?: { errors: string[] } } }
        | undefined
      setErrors({
        announcementText: announcementErrors?.properties?.text?.errors?.[0],
        actionBtn: announcementErrors?.properties?.actionBtn?.errors?.[0],
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
  }, [projectId, config]);

  // setConf from useState is already stable — no need to wrap it. Every
  // consumer (including SaveStyleBtn, which only cares about pending/
  // saveConfig) previously re-rendered on every keystroke because this
  // object was rebuilt every render regardless of what actually changed.
  const contextValue = useMemo(
    () => ({
      config,
      projectId,
      pending,
      setConfig: setConf,
      saveConfig,
      errors,
    }),
    [config, projectId, pending, saveConfig, errors]
  )

  return (
    <WidgetBuilderContext.Provider value={contextValue}>
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
