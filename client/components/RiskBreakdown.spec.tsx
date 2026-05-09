import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import RiskBreakdown from "@/components/RiskBreakdown";
import type { RiskMetric } from "@/lib/dashboardUtils";

const zeroMetrics: RiskMetric[] = Array.from({ length: 5 }, (_, i) => ({
  label: `Metric ${i + 1}`,
  value: 0,
  inverted: false,
}));

function makeMetric(label: string, value: number, inverted: boolean): RiskMetric {
  return { label, value, inverted };
}

describe("RiskBreakdown", () => {
  it("renders exactly 5 metric rows when given 5 metrics", () => {
    const { getAllByTestId } = render(<RiskBreakdown metrics={zeroMetrics} />);
    expect(getAllByTestId("metric-row")).toHaveLength(5);
  });

  it("all bars have width 0% when all metric values are 0", () => {
    const { container } = render(<RiskBreakdown metrics={zeroMetrics} />);
    const bars = container.querySelectorAll('[data-testid="metric-bar"]');
    expect(bars).toHaveLength(5);
    bars.forEach((bar) => {
      expect((bar as HTMLElement).style.width).toBe("0%");
    });
  });

  it("non-inverted metric with value >= 70 gets bg-green-500", () => {
    const { container } = render(
      <RiskBreakdown metrics={[makeMetric("A", 70, false)]} />
    );
    const bar = container.querySelector('[data-testid="metric-bar"]') as HTMLElement;
    expect(bar.className).toContain("bg-green-500");
  });

  it("non-inverted metric with value 40-69 gets bg-amber-500", () => {
    const { container } = render(
      <RiskBreakdown metrics={[makeMetric("A", 55, false)]} />
    );
    const bar = container.querySelector('[data-testid="metric-bar"]') as HTMLElement;
    expect(bar.className).toContain("bg-amber-500");
  });

  it("non-inverted metric with value < 40 gets bg-red-500", () => {
    const { container } = render(
      <RiskBreakdown metrics={[makeMetric("A", 20, false)]} />
    );
    const bar = container.querySelector('[data-testid="metric-bar"]') as HTMLElement;
    expect(bar.className).toContain("bg-red-500");
  });

  it("inverted metric with value > 70 gets bg-red-500", () => {
    const { container } = render(
      <RiskBreakdown metrics={[makeMetric("A", 80, true)]} />
    );
    const bar = container.querySelector('[data-testid="metric-bar"]') as HTMLElement;
    expect(bar.className).toContain("bg-red-500");
  });

  it("inverted metric with value 41-70 gets bg-amber-500", () => {
    const { container } = render(
      <RiskBreakdown metrics={[makeMetric("A", 55, true)]} />
    );
    const bar = container.querySelector('[data-testid="metric-bar"]') as HTMLElement;
    expect(bar.className).toContain("bg-amber-500");
  });

  it("inverted metric with value <= 40 gets bg-green-500", () => {
    const { container } = render(
      <RiskBreakdown metrics={[makeMetric("A", 40, true)]} />
    );
    const bar = container.querySelector('[data-testid="metric-bar"]') as HTMLElement;
    expect(bar.className).toContain("bg-green-500");
  });

  it("renders metric labels", () => {
    const { getByText } = render(<RiskBreakdown metrics={zeroMetrics} />);
    zeroMetrics.forEach((m) => {
      expect(getByText(m.label)).toBeTruthy();
    });
  });
});
