export default function Loader() {
  return (
    <div className="flex items-center justify-center gap-3 rounded-2xl border border-cyan-100 bg-cyan-50/70 px-4 py-3 text-sm font-medium text-cyan-900">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-cyan-200 border-t-cyan-600" />
      Running the recommendation engine...
    </div>
  )
}
