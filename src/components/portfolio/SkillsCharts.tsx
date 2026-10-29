"use client";

/**
 * SkillsCharts — real Chart.js (react-chartjs-2) visualisations for the public
 * Skills & Technologies page. Fully theme-aware (light/dark) and follows the
 * site's live primary color so admin theme changes re-tint the charts too.
 */

import { useMemo } from "react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  RadialLinearScale,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { Doughnut, Radar } from "react-chartjs-2";
import { useLanguage } from "@/context/LanguageContext";
import { usePortfolioData } from "@/context/PortfolioDataContext";
import { useTheme } from "@/context/ThemeContext";
import { localizeDigits } from "@/lib/i18n-utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend
);

ChartJS.defaults.font.size = 11;
ChartJS.defaults.font.family =
  "var(--site-font, inherit), SolaimanLipi, ui-sans-serif, system-ui, sans-serif";

const tooltipStyle = {
  backgroundColor: "rgba(15, 23, 42, 0.92)",
  titleFont: { weight: 700 as const },
  padding: 10,
  cornerRadius: 10,
  displayColors: true,
  boxPadding: 4,
};

function hexAlpha(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/** Live primary color — follows the admin's theme override (site default cyan). */
function useLivePrimary() {
  const { settings } = usePortfolioData();
  const override = (settings.theme_primary_color || "").trim();
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(override) ? override : "#06b6d4";
}

/* ─────────── Radar — top skills landscape ─────────── */
export function SkillsRadar({ skills, height = 300 }: { skills: { name: string; level: number }[]; height?: number }) {
  const { isDark } = useTheme();
  const { isBn } = useLanguage();
  const primary = useLivePrimary();

  const tick = isDark ? "#94a3b8" : "#64748b";
  const grid = isDark ? "rgba(148,163,184,0.14)" : "rgba(100,116,139,0.16)";

  const top = useMemo(
    () => [...skills].sort((a, b) => b.level - a.level).slice(0, 8),
    [skills]
  );

  const data: ChartData<"radar"> = {
    labels: top.map((s) => s.name),
    datasets: [
      {
        label: isBn ? "দক্ষতার মাত্রা %" : "Level %",
        data: top.map((s) => Math.min(100, s.level)),
        backgroundColor: hexAlpha(primary, 0.2),
        borderColor: primary,
        borderWidth: 2,
        pointBackgroundColor: primary,
        pointBorderColor: isDark ? "#0f172a" : "#ffffff",
        pointBorderWidth: 1.5,
        pointHoverRadius: 6,
        pointRadius: 3.5,
      },
    ],
  };

  const options: ChartOptions<"radar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { ...tooltipStyle, displayColors: false },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        angleLines: { color: grid },
        grid: { color: grid },
        pointLabels: { color: tick, font: { size: 10, weight: 600 } },
        ticks: { display: false, stepSize: 25 },
      },
    },
  };

  return (
    <div
      className="relative w-full"
      style={{ height }}
      role="img"
      aria-label={isBn ? "সেরা দক্ষতাগুলোর মাত্রার রাডার চার্ট" : "Radar chart of top skill levels"}
    >
      <Radar data={data} options={options} />
    </div>
  );
}

/* ─────────── Doughnut — category distribution ─────────── */
const doughnutPalette = ["#06b6d4", "#14b8a6", "#f59e0b", "#f43f5e", "#8b5cf6"];

export function SkillsCategoryDoughnut({
  entries,
  height = 300,
}: {
  entries: { label: string; value: number }[];
  height?: number;
}) {
  const { isDark } = useTheme();
  const { isBn } = useLanguage();
  const tick = isDark ? "#94a3b8" : "#64748b";
  const total = entries.reduce((a, b) => a + b.value, 0);

  const data: ChartData<"doughnut"> = {
    labels: entries.map((e) => e.label),
    datasets: [
      {
        data: entries.map((e) => e.value),
        backgroundColor: entries.map((_, i) => doughnutPalette[i % doughnutPalette.length]),
        borderColor: isDark ? "rgba(15,23,42,0.6)" : "rgba(255,255,255,0.6)",
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "64%",
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: tick, usePointStyle: true, boxWidth: 8, padding: 14 },
      },
      tooltip: {
        ...tooltipStyle,
        callbacks: {
          label: (item) => {
            const v = Number(item.parsed);
            const pct = total ? ((v / total) * 100).toFixed(0) : "0";
            return localizeDigits(`${item.label}: ${v} (${pct}%)`, isBn);
          },
        },
      },
    },
  };

  return (
    <div
      className="relative w-full"
      style={{ height }}
      role="img"
      aria-label={isBn ? "ক্যাটাগরি অনুযায়ী দক্ষতার ডোনাট চার্ট" : "Doughnut chart of skills per category"}
    >
      <Doughnut data={data} options={options} />
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-12">
        <span className="text-2xl font-black tabular-nums">{localizeDigits(total, isBn)}</span>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {isBn ? "দক্ষতা" : "skills"}
        </span>
      </div>
    </div>
  );
}
