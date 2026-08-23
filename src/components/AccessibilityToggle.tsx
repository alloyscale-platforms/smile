"use client";

import { useState } from "react";

type TextSize = "base" | "lg" | "xl";

const TEXT_SIZE_CYCLE: TextSize[] = ["base", "lg", "xl"];

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

export function AccessibilityToggle({
  initialTextSize,
  initialContrast,
  labels,
}: {
  initialTextSize: TextSize;
  initialContrast: boolean;
  labels: { textSize: string; highContrast: string };
}) {
  const [textSize, setTextSize] = useState<TextSize>(initialTextSize);
  const [highContrast, setHighContrast] = useState(initialContrast);

  function cycleTextSize() {
    const next =
      TEXT_SIZE_CYCLE[(TEXT_SIZE_CYCLE.indexOf(textSize) + 1) % TEXT_SIZE_CYCLE.length];
    setTextSize(next);
    document.documentElement.setAttribute("data-text-size", next);
    setCookie("text-size", next);
  }

  function toggleContrast() {
    const next = !highContrast;
    setHighContrast(next);
    if (next) {
      document.documentElement.setAttribute("data-contrast", "high");
    } else {
      document.documentElement.removeAttribute("data-contrast");
    }
    setCookie("contrast", next ? "high" : "normal");
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={cycleTextSize}
        aria-label={labels.textSize}
        className="rounded-full border border-border px-3 py-1.5 text-sm font-semibold hover:bg-accent hover:text-accent-foreground"
      >
        A{textSize === "lg" ? "+" : textSize === "xl" ? "++" : ""}
      </button>
      <button
        type="button"
        onClick={toggleContrast}
        aria-pressed={highContrast}
        aria-label={labels.highContrast}
        className="rounded-full border border-border px-3 py-1.5 text-sm font-semibold hover:bg-accent hover:text-accent-foreground"
      >
        ◐
      </button>
    </div>
  );
}
