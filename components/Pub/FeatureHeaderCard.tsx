"use client";
import { CardHeader } from "../ui/card";


export const FeatureHeaderCard = ({ children, featureId }: { children: React.ReactNode, featureId: string }) => {
  const handleSelect = () => {
    window.parent.postMessage({
      type: "openfeed:open-feature",
      featureId
    }, "*")
  };
  return (
    <CardHeader className="p-3 pb-1 cursor-pointer" onClick={handleSelect}>
      {children}
    </CardHeader>
  )
}

