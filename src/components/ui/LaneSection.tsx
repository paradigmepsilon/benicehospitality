import type { ReactNode } from "react";
import { laneVars, type LaneId } from "@/lib/lanes";

interface LaneSectionProps {
  lane: LaneId;
  children: ReactNode;
  /**
   * Draw the lane keyline along the top edge. This is the highest
   * recognition-per-pixel element in the system — literally the edge of the
   * carousel's color block, cropped down to 3px.
   */
  keyline?: boolean;
  className?: string;
}

/**
 * Publishes a lane's tokens as CSS custom properties to everything inside it.
 *
 * A plain wrapper rather than a React context, so it stays a server component
 * and lane-aware children don't have to become client components to read it.
 * See src/lib/lanes.ts for the tokens and the area/saturation rule.
 */
export default function LaneSection({
  lane,
  children,
  keyline = false,
  className = "",
}: LaneSectionProps) {
  return (
    <div
      data-lane={lane}
      style={laneVars(lane)}
      className={["relative", className].filter(Boolean).join(" ")}
    >
      {keyline && (
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-0.75 z-10 bg-(--lane-accent)"
        />
      )}
      {children}
    </div>
  );
}
