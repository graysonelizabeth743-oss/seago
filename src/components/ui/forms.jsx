// src/components/ui/forms.jsx
import { cn } from "@/lib/cn";

const base =
  "w-full rounded-xl border bg-surface px-3.5 text-sm text-ink placeholder:text-muted/70 " +
  "transition-colors duration-150 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/35 " +
  "disabled:opacity-60 disabled:cursor-not-allowed";

export function Field({ label, htmlFor, hint, error, className, children }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-semibold text-ink">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({ label, hint, error, id, className, ...props }) {
  const fieldId = id || props.name;
  return (
    <Field label={label} htmlFor={fieldId} hint={hint} error={error}>
      <input
        id={fieldId}
        aria-invalid={error ? "true" : undefined}
        className={cn(base, "h-11", error ? "border-red-500" : "border-line", className)}
        {...props}
      />
    </Field>
  );
}

export function Textarea({ label, hint, error, id, className, rows = 4, ...props }) {
  const fieldId = id || props.name;
  return (
    <Field label={label} htmlFor={fieldId} hint={hint} error={error}>
      <textarea
        id={fieldId}
        rows={rows}
        aria-invalid={error ? "true" : undefined}
        className={cn(base, "py-3 leading-relaxed resize-y", error ? "border-red-500" : "border-line", className)}
        {...props}
      />
    </Field>
  );
}

export function Select({ label, hint, error, id, className, children, ...props }) {
  const fieldId = id || props.name;
  return (
    <Field label={label} htmlFor={fieldId} hint={hint} error={error}>
      <select
        id={fieldId}
        aria-invalid={error ? "true" : undefined}
        className={cn(base, "h-11 pr-8", error ? "border-red-500" : "border-line", className)}
        {...props}
      >
        {children}
      </select>
    </Field>
  );
}
