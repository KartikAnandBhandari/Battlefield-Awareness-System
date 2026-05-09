import type { RiskMetric } from "@/lib/dashboardUtils";

interface RiskBreakdownProps {
  metrics: RiskMetric[];
}

function getBarColor(value: number, inverted?: boolean): string {
  if (inverted) {
    if (value > 70) return "bg-red-500";
    if (value > 40) return "bg-amber-500";
    return "bg-green-500";
  }
  if (value >= 70) return "bg-green-500";
  if (value >= 40) return "bg-amber-500";
  return "bg-red-500";
}

export default function RiskBreakdown({ metrics }: RiskBreakdownProps) {
  return (
    <div className="flex flex-col gap-3">
      {metrics.map((metric) => (
        <div key={metric.label} data-testid="metric-row" className="flex flex-col gap-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{metric.label}</span>
            <span className="font-medium">{metric.value}%</span>
          </div>
          <div className="h-2 w-full rounded bg-white/10">
            <div
              data-testid="metric-bar"
              className={`h-2 rounded transition-all duration-500 ${getBarColor(metric.value, metric.inverted)}`}
              style={{ width: `${metric.value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
