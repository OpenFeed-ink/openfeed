"use client";
import { createContext, useContext, useState, useTransition } from "react";
import type { Config } from "@/type"
import { saveWidgetConfigAction } from "@/actions/widgets";
import { EMPTY_FORM_STATE } from "@/lib/zodErrorHandle";
import { toast } from "sonner";

type WidgetBuilderContextType = {
  config: Config;
  pending: boolean;
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

  const [config, setConf] = useState<Config>(orginalConfig)

  const setConfig = (config: Config) => setConf(config)

  const saveConfig = async () => {
    const form = new FormData()
    form.set('projectId', projectId)
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
        pending,
        setConfig,
        saveConfig,
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
