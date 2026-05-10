import { cn, getInitials, generateGradient } from "@/lib/utils";

interface AvatarWithStatusProps {
  photoURL?: string | null;
  displayName: string;
  uid: string;
  online?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showStatus?: boolean;
  className?: string;
}

const sizeClasses = {
  xs: "w-7 h-7 text-xs",
  sm: "w-9 h-9 text-sm",
  md: "w-11 h-11 text-base",
  lg: "w-14 h-14 text-lg",
  xl: "w-20 h-20 text-2xl",
};

const statusSizeClasses = {
  xs: "w-2 h-2 bottom-0 right-0",
  sm: "w-2.5 h-2.5 bottom-0 right-0",
  md: "w-3 h-3 bottom-0.5 right-0.5",
  lg: "w-3.5 h-3.5 bottom-0.5 right-0.5",
  xl: "w-4 h-4 bottom-1 right-1",
};

export function AvatarWithStatus({
  photoURL,
  displayName,
  uid,
  online = false,
  size = "md",
  showStatus = true,
  className,
}: AvatarWithStatusProps) {
  const gradient = generateGradient(uid);

  return (
    <div className={cn("relative flex-shrink-0", className)}>
      <div className={cn("rounded-full overflow-hidden flex items-center justify-center font-semibold text-white", sizeClasses[size])}>
        {photoURL ? (
          <img src={photoURL} alt={displayName} className="w-full h-full object-cover" />
        ) : (
          <div className={cn("w-full h-full flex items-center justify-center bg-gradient-to-br", gradient)}>
            {getInitials(displayName)}
          </div>
        )}
      </div>
      {showStatus && (
        <span
          className={cn(
            "absolute rounded-full border-2 border-sidebar",
            statusSizeClasses[size],
            online ? "bg-emerald-500" : "bg-muted-foreground/40"
          )}
        />
      )}
    </div>
  );
}
