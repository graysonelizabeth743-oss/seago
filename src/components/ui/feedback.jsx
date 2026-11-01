// src/components/ui/feedback.jsx
import { cn } from "@/lib/cn";
import Icon from "@/components/ui/Icon";

export function Spinner({ size = 20, className }) {
  return <Icon name="loader" size={size} className={cn("animate-spin text-link", className)} />;
}

export function PageLoader({ label = "Loading…" }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center gap-3 text-sm text-muted" role="status">
      <Spinner />
      {label}
    </div>
  );
}

export function Alert({ tone = "error", children, className }) {
  const tones = {
    error: "border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200",
    info: "border-brand-200 bg-brand-50 text-brand-950 dark:border-brand-800 dark:bg-brand-900/30 dark:text-brand-100",
    warning: "border-orange-200 bg-orange-50 text-orange-900 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-200",
  };
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm", tones[tone], className)}
    >
      <Icon name={tone === "success" ? "success" : "alert"} size={16} className="mt-0.5 shrink-0" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function EmptyState({ icon = "inbox", title, children, action }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-soft text-link">
        <Icon name={icon} size={22} />
      </span>
      <h3 className="text-base font-bold">{title}</h3>
      {children && <p className="mt-1.5 max-w-sm text-sm text-muted">{children}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Badge({ tone = "neutral", children, className }) {
  const tones = {
    neutral: "bg-graphite-100 text-graphite-700 dark:bg-graphite-800 dark:text-graphite-200",
    info: "bg-brand-100 text-brand-900 dark:bg-brand-400/15 dark:text-brand-200",
    success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
    warning: "bg-orange-100 text-orange-800 dark:bg-orange-500/15 dark:text-orange-300",
    danger: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", tones[tone], className)}>
      {children}
    </span>
  );
}
