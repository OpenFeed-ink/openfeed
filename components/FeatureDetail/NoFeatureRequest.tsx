
export const NoFeatureRequest = () => {
  return (
    <div className="flex h-full min-h-100 items-center justify-center rounded-lg border bg-card p-8 text-center">
      <div>
        <div className="mx-auto h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-medium">No Feature Request or Feedback selected</h3>
        <p className="text-sm text-muted-foreground">
          Click on a Feature Request item to view details
        </p>
      </div>
    </div>
  )
}
