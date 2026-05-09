import { Unit } from "@/lib/simulationEngine";
import { cn } from "@/lib/utils";

interface UnitRosterProps {
  units: Unit[];
  selectedUnit: string | null;
  onUnitSelect: (unitId: string) => void;
}

const STATUS_ORDER: Record<Unit["status"], number> = {
  critical: 0,
  warning: 1,
  active: 2,
  idle: 3,
};

const STATUS_DOT: Record<Unit["status"], string> = {
  critical: "bg-red-500",
  warning: "bg-amber-500",
  active: "bg-green-500",
  idle: "bg-gray-500",
};

interface MiniBarProps {
  label: string;
  value: number;
  barColor: string;
}

function MiniBar({ label, value, barColor }: MiniBarProps) {
  return (
    <div className="flex items-center gap-1 min-w-0">
      <span className="text-[10px] text-white/40 shrink-0">{label}</span>
      <div className="h-1 w-full bg-white/10 rounded overflow-hidden">
        <div
          className={cn("h-full rounded", barColor)}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function UnitRoster({ units, selectedUnit, onUnitSelect }: UnitRosterProps) {
  const sorted = [...units].sort(
    (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
  );

  return (
    <div className="overflow-y-auto max-h-64 space-y-1">
      {sorted.map((unit) => {
        const isSelected = unit.id === selectedUnit;
        return (
          <div
            key={unit.id}
            data-testid="unit-row"
            onClick={() => onUnitSelect(unit.id)}
            className={cn(
              "px-2 py-1.5 rounded cursor-pointer border transition-colors",
              isSelected
                ? "bg-cyan-500/10 border-cyan-500/50"
                : "bg-black/20 border-white/5 hover:border-white/20"
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={cn("w-2 h-2 rounded-full shrink-0", STATUS_DOT[unit.status])} />
              <span className="text-sm font-medium text-white truncate">{unit.name}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
              <MiniBar label="HP" value={unit.health} barColor="bg-green-500" />
              <MiniBar label="FL" value={unit.fuel} barColor="bg-cyan-500" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
