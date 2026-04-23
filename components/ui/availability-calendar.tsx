"use client";

import type { AvailabilityRange } from "../../lib/types";

type AvailabilityCalendarProps = {
  ranges: AvailabilityRange[];
  fromDate?: string;
  toDate?: string;
  startsAt?: string;
};

export function AvailabilityCalendar({
  ranges,
  fromDate,
  toDate,
  startsAt,
}: AvailabilityCalendarProps) {
  const anchorDate = startsAt
    ? new Date(startsAt)
    : fromDate
      ? new Date(fromDate)
      : new Date();
  const monthStart = new Date(anchorDate.getFullYear(), anchorDate.getMonth(), 1);
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - monthStart.getDay());
  const days = Array.from({ length: 42 }, (_, index) => {
    const nextDate = new Date(gridStart);
    nextDate.setDate(gridStart.getDate() + index);
    return nextDate;
  });

  const selectedStart = fromDate ? new Date(fromDate) : startsAt ? new Date(startsAt) : null;
  const selectedEnd = toDate ? new Date(toDate) : selectedStart;

  return (
    <div className="availability-calendar">
      <div className="availability-calendar-head">
        <strong>
          {anchorDate.toLocaleString("en-US", { month: "long", year: "numeric" })}
        </strong>
        <span className="status-copy">Green = available, red = unavailable</span>
      </div>
      <div className="availability-grid week-labels">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="availability-grid">
        {days.map((day) => {
          const isoDate = day.toISOString().slice(0, 10);
          const isAvailable = ranges.some((range) => {
            const rangeStart = new Date(range.starts_at);
            const rangeEnd = new Date(range.ends_at);
            return day >= startOfDay(rangeStart) && day <= endOfDay(rangeEnd);
          });
          const isSelected =
            selectedStart && selectedEnd
              ? day >= startOfDay(selectedStart) && day <= endOfDay(selectedEnd)
              : false;
          const isOutsideMonth = day.getMonth() !== anchorDate.getMonth();
          return (
            <div
              key={isoDate}
              className={[
                "availability-day",
                isAvailable ? "available" : "unavailable",
                isSelected ? "selected" : "",
                isOutsideMonth ? "outside" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <span>{day.getDate()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function endOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate(), 23, 59, 59, 999);
}
