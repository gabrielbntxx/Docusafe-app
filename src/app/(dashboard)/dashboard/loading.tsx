export default function DashboardPageLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-blue-500 dark:border-neutral-700 dark:border-t-blue-400" />
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Chargement...</p>
      </div>
    </div>
  );
}
