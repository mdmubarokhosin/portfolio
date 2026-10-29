"use client";

/**
 * admin-charts — real Chart.js components (via react-chartjs-2) used across
 * the Admin Panel: dashboard bar/doughnut/radar, Backup & Sync storage charts.
 *
 * All charts are theme-aware: they read the live --primary color so charts
 * re-tint themselves when the admin changes the theme color in Site Settings.
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
import { Bar, Doughnut, Radar, Line } from "react-chartjs-2";
import { usePortfolioData } from "@/context/PortfolioDataContext";

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

/** Live primary color — follows the admin's theme override (site default cyan). */
export function useChartTheme() {
  const { settings } = usePortfolioData();
  const override = (settings.theme_primary_color || "").trim();

  const primary = useMemo(
    () => (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(override) ? override : "#06b6d4"),
    [override]
  );

  return useMemo(
    () => ({
      primary,
      primarySoft: hexAlpha(primary, 0.55),
      primaryFill: hexAlpha(primary, 0.22),
      grid: "rgba(100, 116, 139, 0.16)",
      tick: "#64748b",
      secondary: "#f59e0b",
      teal: "#14b8a6",
      emerald: "#10b981",
      rose: "#f43f5e",
    }),
    [primary]
  );
}

function hexAlpha(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/* ─────────── Shared container ─────────── */
export function ChartFrame({
  children,
  height = 240,
  label,
}: {
  children: React.ReactNode;
  height?: number;
  label: string;
}) {
  return (
    <div
      className="relative w-full"
      style={{ height }}
      role="img"
      aria-label={label}
    >
      {children}
    </div>
  );
}

const commonTooltip = {
  backgroundColor: "rgba(15, 23, 42, 0.92)",
  titleFont: { weight: 700 as const },
  padding: 10,
  cornerRadius: 10,
  displayColors: true,
  boxPadding: 4,
};

/* ─────────── Vertical bar — items per section (Dashboard) ─────────── */
export function SectionItemsChart({
  entries,
  height = 240,
}: {
  entries: { label: string; value: number }[];
  height?: number;
}) {
  const t = useChartTheme();

  const data: ChartData<"bar"> = {
    labels: entries.map((e) => e.label),
    datasets: [
      {
        label: "Items",
        data: entries.map((e) => e.value),
        backgroundColor: (ctx) => {
          const { chart } = ctx;
          const { ctx: c, chartArea } = chart;
          if (!chartArea) return t.primarySoft;
          const g = c.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          g.addColorStop(0, hexAlpha(t.primary, 0.25));
          g.addColorStop(1, t.primary);
          return g;
        },
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 46,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { ...commonTooltip, displayColors: false },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: t.tick, maxRotation: 45 } },
      y: {
        beginAtZero: true,
        grid: { color: t.grid },
        border: { display: false },
        ticks: { color: t.tick, precision: 0 },
      },
    },
  };

  return (
    <ChartFrame height={height} label="Bar chart of items per portfolio section">
      <Bar data={data} options={options} />
    </ChartFrame>
  );
}

/* ─────────── Doughnut — messages read/unread (Dashboard & Messages) ── */
export function MessagesDoughnut({
  read,
  unread,
  height = 200,
}: {
  read: number;
  unread: number;
  height?: number;
}) {
  const t = useChartTheme();
  const total = read + unread;

  const data: ChartData<"doughnut"> = {
    labels: ["Read", "Unread"],
    datasets: [
      {
        data: [read, unread],
        backgroundColor: [t.primary, hexAlpha(t.secondary, 0.75)],
        borderColor: "rgba(255,255,255,0.35)",
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: t.tick, usePointStyle: true, boxWidth: 8, padding: 14 },
      },
      tooltip: commonTooltip,
    },
  };

  return (
    <div className="relative" style={{ height }} role="img" aria-label={`Messages: ${read} read, ${unread} unread`}>
      <Doughnut data={data} options={options} />
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-10">
        <span className="text-2xl font-black tabular-nums">{total}</span>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">total</span>
      </div>
    </div>
  );
}

/* ─────────── Radar — top skills (Dashboard & Skills editor) ─────────── */
export function SkillsRadarChart({
  skills,
  height = 300,
  max = 10,
}: {
  skills: { name: string; level: number }[];
  height?: number;
  max?: number;
}) {
  const t = useChartTheme();
  const top = [...skills].sort((a, b) => b.level - a.level).slice(0, max);

  const data: ChartData<"radar"> = {
    labels: top.map((s) => s.name),
    datasets: [
      {
        label: "Level %",
        data: top.map((s) => Math.min(100, s.level)),
        backgroundColor: hexAlpha(t.primary, 0.22),
        borderColor: t.primary,
        borderWidth: 2,
        pointBackgroundColor: t.primary,
        pointBorderColor: "#fff",
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
      tooltip: { ...commonTooltip, displayColors: false },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        angleLines: { color: t.grid },
        grid: { color: t.grid },
        pointLabels: { color: t.tick, font: { size: 10 } },
        ticks: { display: false, stepSize: 25 },
      },
    },
  };

  return (
    <ChartFrame height={height} label="Radar chart of top skill levels">
      <Radar data={data} options={options} />
    </ChartFrame>
  );
}

/* ─────────── Horizontal bar — data size per section (Backup & Sync) ── */
export function SectionSizeChart({
  entries,
  height = 320,
}: {
  entries: { label: string; value: number }[];
  height?: number;
}) {
  const t = useChartTheme();

  const data: ChartData<"bar"> = {
    labels: entries.map((e) => e.label),
    datasets: [
      {
        label: "KB",
        data: entries.map((e) => Math.round(e.value * 10) / 10),
        backgroundColor: (ctx) => {
          const { chart } = ctx;
          const { ctx: c, chartArea } = chart;
          if (!chartArea) return t.primarySoft;
          const g = c.createLinearGradient(0, 0, chartArea.right, 0);
          g.addColorStop(0, hexAlpha(t.primary, 0.3));
          g.addColorStop(1, t.primary);
          return g;
        },
        borderRadius: 6,
        borderSkipped: false,
        maxBarThickness: 18,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    indexAxis: "y" as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        ...commonTooltip,
        displayColors: false,
        callbacks: {
          label: (item) => `${item.parsed.x} KB`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: t.grid },
        border: { display: false },
        ticks: { color: t.tick, callback: (v) => `${v}` },
      },
      y: { grid: { display: false }, ticks: { color: t.tick, font: { size: 10 } } },
    },
  };

  return (
    <ChartFrame height={height} label="Horizontal bar chart of Firebase data size per section">
      <Bar data={data} options={options} />
    </ChartFrame>
  );
}

/* ─────────── Stacked doughnut — storage distribution (Backup & Sync) ─ */
export function StorageDoughnut({
  parts,
  height = 210,
}: {
  parts: { label: string; value: number; color?: string }[];
  height?: number;
}) {
  const t = useChartTheme();
  const palette = [t.primary, t.teal, t.secondary, t.rose, t.emerald];
  const total = parts.reduce((a, b) => a + b.value, 0);

  const data: ChartData<"doughnut"> = {
    labels: parts.map((p) => p.label),
    datasets: [
      {
        data: parts.map((p) => Math.max(0.001, p.value)),
        backgroundColor: parts.map((p, i) => p.color ?? palette[i % palette.length]),
        borderColor: "rgba(255,255,255,0.35)",
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
        labels: { color: t.tick, usePointStyle: true, boxWidth: 8, padding: 12 },
      },
      tooltip: {
        ...commonTooltip,
        callbacks: {
          label: (item) => {
            const v = Number(item.parsed);
            const pct = total ? ((v / total) * 100).toFixed(1) : "0";
            return `${item.label}: ${fmtKB(v)} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="relative" style={{ height }} role="img" aria-label="Storage distribution doughnut chart">
      <Doughnut data={data} options={options} />
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-10">
        <span className="text-xl font-black tabular-nums">{fmtKB(total)}</span>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">total</span>
      </div>
    </div>
  );
}

/* ─────────── Line — visitors trend placeholder style (Dashboard) ───── */
export function VisitorsLineChart({
  points,
  height = 220,
}: {
  points: { label: string; value: number }[];
  height?: number;
}) {
  const t = useChartTheme();

  const data: ChartData<"line"> = {
    labels: points.map((p) => p.label),
    datasets: [
      {
        label: "Visitors",
        data: points.map((p) => p.value),
        borderColor: t.primary,
        backgroundColor: hexAlpha(t.primary, 0.18),
        fill: true,
        tension: 0.4,
        borderWidth: 2.5,
        pointRadius: 2.5,
        pointBackgroundColor: t.primary,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { ...commonTooltip, displayColors: false },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: t.tick, maxRotation: 0 } },
      y: {
        beginAtZero: true,
        grid: { color: t.grid },
        border: { display: false },
        ticks: { color: t.tick, precision: 0 },
      },
    },
  };

  return (
    <ChartFrame height={height} label="Line chart of visitor milestones">
      <Line data={data} options={options} />
    </ChartFrame>
  );
}

export function fmtKB(bytes: number): string {
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb < 10 ? kb.toFixed(1) : Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}
