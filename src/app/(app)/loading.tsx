export default function AppLoading() {
  return (
    <div className="animate-pulse space-y-7" aria-label="Cargando">
      <div className="h-5 w-32 rounded-full bg-line" />
      <div className="h-14 w-3/4 max-w-xl rounded-2xl bg-line" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-[420px] rounded-[2.25rem] bg-line" />
        <div className="h-[420px] rounded-[2.25rem] bg-line" />
      </div>
    </div>
  );
}
