/** Only allow same-site relative redirects (prevents open-redirect abuse). */
export function safeNext(value, fallback = "/portal") {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  return value;
}
