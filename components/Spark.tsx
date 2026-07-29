"use client";

export function Spark({ values }: { values?: number[] }) {
  if (!values || values.length < 2) {
    return <div className="spark text-arc-muted/40 text-[10px]">—</div>;
  }
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const w = 72;
  const h = 28;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * (w - 2) + 1;
      const y = h - ((v - min) / span) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");
  const up = values[values.length - 1] >= values[0];
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={up ? "#3ddc97" : "#ff5c7a"}
        strokeWidth="1.5"
        points={pts}
      />
    </svg>
  );
}
