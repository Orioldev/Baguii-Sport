import { cn } from "@/lib/utils";



export const FieldHint = ({ text, type }: { text: string; type: "error" | "ok" | "info" }) => {
  return (
    <p
      className={cn(
        "mt-1.5 text-[12px]",
        type === "error" && "text-destructive",
        type === "ok"    && "text-emerald-600 dark:text-emerald-400",
        type === "info"  && "text-muted-foreground",
      )}
    >
      {text}
    </p>
  );
}