import { useRef } from 'react';
import { useGameData } from './GameData';

export interface ResourceDisplayProps {
  /** Resource key in GameData.resources */
  resource: string;
  /** Optional label to show before the value (defaults to resource name) */
  label?: string;
  /** Optional formatter for the numeric value */
  format?: (value: number) => React.ReactNode;
  /** Fallback content when the resource does not yet exist */
  fallback?: React.ReactNode;
  /** Rounds value to this many fractional digits (applied before format) */
  precision?: number;
  className?: string;
  /** If true, visually highlight changes briefly */
  highlightChanges?: boolean;
}

/**
 * Displays a single resource value with an optional label and formatting.
 * Usage: <ResourceDisplay resource="second" label="Seconds" />
 */
export default function ResourceDisplay({
  resource,
  label,
  format,
  fallback = 0,
  precision = 0,
  className,
  highlightChanges = true,
}: ResourceDisplayProps) {
  const { data } = useGameData();
  const raw = data.resources[resource];
  const exists = raw !== undefined;
  const value = exists ? raw : 0;

  const prevRef = useRef<number>(value);
  const changed = value !== prevRef.current;
  if (changed) prevRef.current = value;

  const rounded = precision > 0 ? Number(value.toFixed(precision)) : value;
  const rendered = exists ? (format ? format(rounded) : rounded) : fallback;

  if (!exists || rounded === 0 && fallback === null) return <></>;

  return (
    <span
      className={
        'resource-display inline-flex items-baseline gap-1 ' +
        (className ?? '') +
        (highlightChanges && changed ? ' animate-pulse-fast' : '')
      }
      data-resource={resource}
    >
      <span className="resource-label">{label ?? resource}</span>
      <span className="resource-sep ">:</span>
      <span className="resource-value tabular-nums">{rendered}</span>
    </span>
  );
}
