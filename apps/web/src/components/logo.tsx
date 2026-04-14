import { WandSparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent shadow-glow">
        <WandSparkles className="h-5 w-5 text-white" />
      </div>
      <div>
        <div className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-400">Editron</div>
        <div className="text-xs text-zinc-500">Voice-first video editing</div>
      </div>
    </div>
  );
}
