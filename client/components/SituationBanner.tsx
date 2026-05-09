import { cn } from "@/lib/utils";

interface SituationBannerProps {
  summary: string;
  overallRisk: number; // 0–100
  criticalCount: number;
  timestamp: Date;
}

function formatTime(date: Date): string {
  return date.toTimeString().slice(0, 8); // HH:MM:SS
}

function getRiskClasses(overallRisk: number): string {
  if (overallRisk > 70) {
    return "bg-red-900/80 border-red-500/50 text-red-100";
  }
  if (overallRisk >= 40) {
    return "bg-amber-900/80 border-amber-500/50 text-amber-100";
  }
  return "bg-slate-900/80 border-slate-700/50 text-slate-100";
}

export default function SituationBanner({
  summary,
  overallRisk,
  criticalCount,
  timestamp,
}: SituationBannerProps) {
  return (
    <div
      className={cn(
        "flex h-12 w-full items-center justify-between border-b px-4",
        getRiskClasses(overallRisk),
        criticalCount > 0 && "animate-pulse"
      )}
    >
      <span className="truncate text-sm font-semibold tracking-wide">
        {summary}
      </span>
      <span className="ml-4 shrink-0 font-mono text-xs opacity-75">
        {formatTime(timestamp)}
      </span>
    </div>
  );
}
