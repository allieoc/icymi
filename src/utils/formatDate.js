export function formatRelativeTime(dateString) {
    if (!dateString) return "";
  
    const now = new Date();
    const published = new Date(dateString);
    const diffMs = now - published;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
  
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHr < 24) return `${diffHr} hr${diffHr > 1 ? "s" : ""} ago`;
    if (diffDay === 1) return "Yesterday";
  
    return published.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  