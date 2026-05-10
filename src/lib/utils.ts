import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMessageTime(timestamp: unknown): string {
  if (!timestamp) return "";
  const date = (timestamp as { toDate?: () => Date }).toDate?.() ?? new Date(timestamp as number);
  return format(date, "HH:mm");
}

export function formatChatTime(timestamp: unknown): string {
  if (!timestamp) return "";
  const date = (timestamp as { toDate?: () => Date }).toDate?.() ?? new Date(timestamp as number);
  if (isToday(date)) return format(date, "HH:mm");
  if (isYesterday(date)) return "Yesterday";
  return format(date, "dd/MM/yy");
}

export function formatLastSeen(lastSeen: number | null): string {
  if (!lastSeen) return "a while ago";
  return formatDistanceToNow(new Date(lastSeen), { addSuffix: true });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function generateGradient(uid: string): string {
  const gradients = [
    "from-violet-500 to-purple-600",
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
    "from-orange-500 to-red-500",
    "from-pink-500 to-rose-500",
    "from-indigo-500 to-blue-500",
    "from-amber-500 to-orange-500",
    "from-teal-500 to-emerald-500",
  ];
  const index = uid.charCodeAt(0) % gradients.length;
  return gradients[index];
}

export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
