import type { ActionState } from "@/lib/forms";

export function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p className="mt-1.5 text-sm font-medium text-danger" role="alert">
      {errors[0]}
    </p>
  );
}

export function FormStatus({ state }: { state: ActionState }) {
  if (!state.message) return null;
  return (
    <div
      className={
        state.status === "success"
          ? "rounded-2xl bg-brand-soft px-4 py-3 text-sm font-medium text-brand-strong"
          : "rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-danger"
      }
      role={state.status === "error" ? "alert" : "status"}
    >
      {state.message}
    </div>
  );
}
