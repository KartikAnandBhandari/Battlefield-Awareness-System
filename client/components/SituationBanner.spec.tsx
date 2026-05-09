import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SituationBanner from "@/components/SituationBanner";

const baseProps = {
  summary: "All systems nominal",
  overallRisk: 0,
  criticalCount: 0,
  timestamp: new Date("2024-01-01T12:00:00"),
};

describe("SituationBanner", () => {
  it("neutral state: renders with slate background when overallRisk=0", () => {
    const { container } = render(<SituationBanner {...baseProps} />);
    expect(container.firstChild).toHaveClass("bg-slate-900/80");
  });

  it("red background when overallRisk > 70", () => {
    const { container } = render(
      <SituationBanner {...baseProps} overallRisk={80} />,
    );
    expect(container.firstChild).toHaveClass("bg-red-900/80");
  });

  it("amber background when overallRisk is in 40–70 range", () => {
    const { container } = render(
      <SituationBanner {...baseProps} overallRisk={55} />,
    );
    expect(container.firstChild).toHaveClass("bg-amber-900/80");
  });

  it("amber background at boundary overallRisk=40", () => {
    const { container } = render(
      <SituationBanner {...baseProps} overallRisk={40} />,
    );
    expect(container.firstChild).toHaveClass("bg-amber-900/80");
  });

  it("has animate-pulse class when criticalCount > 0", () => {
    const { container } = render(
      <SituationBanner {...baseProps} criticalCount={2} />,
    );
    expect(container.firstChild).toHaveClass("animate-pulse");
  });

  it("does NOT have animate-pulse class when criticalCount=0", () => {
    const { container } = render(<SituationBanner {...baseProps} />);
    expect(container.firstChild).not.toHaveClass("animate-pulse");
  });

  it("no interactive elements (no buttons, inputs, or links)", () => {
    const { container } = render(<SituationBanner {...baseProps} />);
    expect(container.querySelector("button")).toBeNull();
    expect(container.querySelector("input")).toBeNull();
    expect(container.querySelector("a")).toBeNull();
  });

  it("displays the summary text", () => {
    render(<SituationBanner {...baseProps} summary="Critical zone detected" />);
    expect(screen.getByText("Critical zone detected")).toBeInTheDocument();
  });

  it("displays the formatted timestamp", () => {
    render(<SituationBanner {...baseProps} />);
    expect(screen.getByText("12:00:00")).toBeInTheDocument();
  });
});
