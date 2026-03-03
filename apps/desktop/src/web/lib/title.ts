export function extractFallbackTitle(content: string): string {
  const contentTitle = content.trim().split("\n")[0] || "";
  const hasContentTitle = contentTitle.startsWith("#");

  return hasContentTitle
    ? contentTitle.replace(/^#+\s*/, "")
    : content.trim().slice(0, 40) + (content.length > 40 ? "..." : "");
}
