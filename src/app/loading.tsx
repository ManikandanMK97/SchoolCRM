export default function Loading() {
  return (
    <main
      role="status"
      aria-busy="true"
      aria-label="Loading EduSphere ERP"
      className="grid min-h-screen place-items-center"
    >
      <span className="sr-only">Loading EduSphere ERP</span>
      <div className="border-primary/20 border-t-primary size-8 animate-spin rounded-full border-2" />
    </main>
  );
}
