import Link from "next/link";
import { cn } from "@/lib/cn";
import Icon from "@/components/ui/Icon";

const variants = {
  primary:
    "bg-primary text-white hover:bg-primary-hover shadow-sm shadow-sea-900/10 disabled:hover:bg-primary",
  secondary:
    "bg-surface text-ink border border-line hover:border-sea-400 hover:text-link disabled:hover:border-line disabled:hover:text-ink",
  ghost: "text-ink hover:bg-soft",
  light: "bg-white text-sea-900 hover:bg-sea-50 shadow-sm",
  outlineLight: "border border-white/30 text-white hover:bg-white/10",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const sizes = {
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

/**
 * <Button> renders a <Link> when `href` is given, otherwise a <button>.
 * `loading` disables the button and shows a spinner.
 */
export default function Button({
  href,
  variant = "primary",
  size = "md",
  loading = false,
  className,
  children,
  type = "button",
  disabled,
  ...props
}) {
  const classes = cn(
    "inline-flex items-center justify-center rounded-xl font-semibold whitespace-nowrap select-none",
    "transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.98]",
    "disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100",
    variants[variant],
    sizes[size],
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...props}>
      {loading && <Icon name="loader" size={16} className="animate-spin" />}
      {children}
    </button>
  );
}
