import { TooltipProvider } from "@/components/ui/tooltip";

// Authorization/permission context used to live here and run its two queries
// on every /pub/* request — including roadmap and changelog, which are pure
// read-only views that never consume either context. Only the feature-detail
// page actually needs them (edit/delete/pin/comment permission checks), so
// they're fetched there instead. Anonymous roadmap/changelog visitors now
// cost two fewer DB round trips per view.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <TooltipProvider>
      {children}
    </TooltipProvider>
  );
}
