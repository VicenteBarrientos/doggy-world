import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="border-2 border-dashed border-ink bg-white px-6 py-12 text-center shadow-[4px_4px_0_var(--ink)]">
      <div className="mx-auto flex size-14 items-center justify-center border-2 border-ink bg-sun text-2xl text-ink shadow-[2px_2px_0_var(--ink)]">
        {icon}
      </div>
      <h3 className="mt-5 font-display text-2xl uppercase">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink/75">{description}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
