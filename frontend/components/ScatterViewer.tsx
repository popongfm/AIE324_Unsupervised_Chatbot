"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Layers,
  Palette,
  RotateCcw,
  AlertTriangle,
  X,
  MousePointer,
  BoxSelect,
  LassoSelect,
} from "lucide-react";

// Load Plotly.js dynamically on client side only to avoid SSR window errors in Next.js
const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export interface PointData {
  id: number;
  x: number;
  y: number;
  z: number;
  cluster: number;
  is_anomaly: boolean;
  raw_data: Record<string, any>;
}

interface Props {
  points: PointData[];
  is3D: boolean;
  onSelectPoint?: (point: PointData | null) => void;
  onSelectCluster?: (selectedPoints: PointData[]) => void;
  onToggle3D?: (is3D: boolean) => void;
}

const COLORSCALES = ["Viridis", "Plasma", "Turbo", "Rainbow", "Cividis"];

export default function ScatterViewer({
  points,
  is3D,
  onSelectPoint,
  onSelectCluster,
  onToggle3D,
}: Props) {
  const [colorscale, setColorscale] = useState("Viridis");
  const [annotations, setAnnotations] = useState<any[]>([]);
  const [activePin, setActivePin] = useState<PointData | null>(null);

  // Drag selection mode for 2D plot: 'pan' | 'select' (box) | 'lasso'
  const [dragMode, setDragMode] = useState<"pan" | "select" | "lasso">("select");
  const [selectedPoints, setSelectedPoints] = useState<PointData[]>([]);

  // Split normal points and anomaly points for distinct markers and colors
  const normalPoints = points.filter((p) => !p.is_anomaly);
  const anomalyPoints = points.filter((p) => p.is_anomaly);

  // Build selected index sets for visual dimming
  const selectedIdSet = new Set(selectedPoints.map((p) => p.id));
  const hasSelection = selectedPoints.length > 0;

  const normalSelectedIndices = hasSelection
    ? normalPoints
        .map((p, idx) => (selectedIdSet.has(p.id) ? idx : null))
        .filter((idx): idx is number => idx !== null)
    : undefined;

  const anomalySelectedIndices = hasSelection
    ? anomalyPoints
        .map((p, idx) => (selectedIdSet.has(p.id) ? idx : null))
        .filter((idx): idx is number => idx !== null)
    : undefined;

  // Reset selection when points change (e.g. new dataset or ML rerun)
  useEffect(() => {
    setSelectedPoints([]);
    setAnnotations([]);
    setActivePin(null);
  }, [points]);

  // Trace for Normal points
  const normalTrace: any = {
    x: normalPoints.map((p) => p.x),
    y: normalPoints.map((p) => p.y),
    mode: "markers",
    type: is3D ? "scatter3d" : "scatter",
    name: "Normal Clusters",
    marker: {
      size: is3D ? 5 : 7.5,
      color: normalPoints.map((p) => p.cluster),
      colorscale: colorscale,
      showscale: true,
      colorbar: {
        title: "Cluster",
        thickness: 10,
        len: 0.6,
        tickfont: { color: "#64748b", size: 10 },
        titlefont: { color: "#0f172a", size: 11 },
      },
      opacity: 0.9,
    },
    text: normalPoints.map((p) => `Sample #${p.id} | Cluster: ${p.cluster}`),
    hoverinfo: "text",
  };

  if (is3D) {
    normalTrace.z = normalPoints.map((p) => p.z);
  } else if (hasSelection) {
    normalTrace.selectedpoints = normalSelectedIndices;
    normalTrace.selected = { marker: { opacity: 1.0 } };
    normalTrace.unselected = { marker: { opacity: 0.15 } };
  }

  // Trace for Anomaly points (diamond symbol)
  const anomalyTrace: any = {
    x: anomalyPoints.map((p) => p.x),
    y: anomalyPoints.map((p) => p.y),
    mode: "markers",
    type: is3D ? "scatter3d" : "scatter",
    name: "Anomalies",
    marker: {
      size: is3D ? 8.5 : 11,
      color: "#e11d48",
      symbol: "diamond",
      line: { color: "#ffffff", width: 1.5 },
      opacity: 1,
    },
    text: anomalyPoints.map((p) => `[Outlier] Sample #${p.id}`),
    hoverinfo: "text",
  };

  if (is3D) {
    anomalyTrace.z = anomalyPoints.map((p) => p.z);
  } else if (hasSelection) {
    anomalyTrace.selectedpoints = anomalySelectedIndices;
    anomalyTrace.selected = { marker: { opacity: 1.0 } };
    anomalyTrace.unselected = { marker: { opacity: 0.15 } };
  }

  const traces = anomalyPoints.length > 0 ? [normalTrace, anomalyTrace] : [normalTrace];

  const axisStyle = {
    showbackground: true,
    backgroundcolor: "#f8fafc",
    gridcolor: "#f1f5f9",
    zerolinecolor: "#e2e8f0",
    tickfont: { color: "#64748b", size: 9 },
    titlefont: { color: "#334155", size: 10 },
  };

  const layout: any = {
    paper_bgcolor: "#ffffff",
    plot_bgcolor: "#ffffff",
    margin: { l: 0, r: 0, b: 0, t: 20 },
    showlegend: true,
    dragmode: is3D ? "orbit" : dragMode,
    legend: {
      x: 0.02,
      y: 0.98,
      font: { color: "#0f172a", size: 11 },
      bgcolor: "rgba(255, 255, 255, 0.9)",
      bordercolor: "#e2e8f0",
      borderwidth: 1,
    },
    annotations: annotations,
  };

  if (is3D) {
    layout.scene = {
      xaxis: axisStyle,
      yaxis: axisStyle,
      zaxis: axisStyle,
      aspectratio: { x: 1, y: 1, z: 0.8 },
      camera: { eye: { x: 1.35, y: 1.35, z: 1.35 } },
      annotations: annotations,
    };
  } else {
    layout.xaxis = { gridcolor: "#f1f5f9", zerolinecolor: "#e2e8f0", tickfont: { color: "#64748b" } };
    layout.yaxis = { gridcolor: "#f1f5f9", zerolinecolor: "#e2e8f0", tickfont: { color: "#64748b" } };
  }

  // Handle single click point pin
  const handlePlotClick = (e: any) => {
    if (!e.points || e.points.length === 0) return;
    const ptIdx = e.points[0].pointIndex;
    const isFromAnomaly = e.points[0].data.name.includes("Anomal");
    const clicked = isFromAnomaly ? anomalyPoints[ptIdx] : normalPoints[ptIdx];

    if (clicked) {
      setActivePin(clicked);
      if (onSelectPoint) onSelectPoint(clicked);

      const annotationItem = {
        x: clicked.x,
        y: clicked.y,
        text: `Point #${clicked.id} (${clicked.is_anomaly ? "Outlier" : `Cluster ${clicked.cluster}`})`,
        showarrow: true,
        arrowhead: 2,
        arrowcolor: clicked.is_anomaly ? "#e11d48" : "#2563eb",
        font: { color: "#0f172a", size: 10, family: "sans-serif" },
        bgcolor: "#ffffff",
        bordercolor: clicked.is_anomaly ? "#e11d48" : "#2563eb",
        borderwidth: 1.5,
        borderpad: 5,
      };

      if (is3D) {
        (annotationItem as any).z = clicked.z;
      }
      setAnnotations([annotationItem]);
    }
  };

  // Handle Drag Selection (Box select & Lasso select in 2D mode)
  const handlePlotSelected = (eventData: any) => {
    if (!eventData || !eventData.points || eventData.points.length === 0) {
      setSelectedPoints([]);
      if (onSelectCluster) onSelectCluster([]);
      return;
    }

    const selected: PointData[] = [];
    const idSet = new Set<number>();

    for (const pt of eventData.points) {
      const isFromAnomaly = pt.data?.name?.includes("Anomal");
      const sourceArray = isFromAnomaly ? anomalyPoints : normalPoints;
      const item = sourceArray[pt.pointIndex];
      if (item && !idSet.has(item.id)) {
        idSet.add(item.id);
        selected.push(item);
      }
    }

    setSelectedPoints(selected);
    if (onSelectCluster) {
      onSelectCluster(selected);
    }
  };

  const handlePlotDeselect = () => {
    setSelectedPoints([]);
    if (onSelectCluster) onSelectCluster([]);
  };

  const handleClearPin = () => {
    setAnnotations([]);
    setActivePin(null);
    if (onSelectPoint) onSelectPoint(null);
  };

  const handleClearSelection = () => {
    setSelectedPoints([]);
    if (onSelectCluster) onSelectCluster([]);
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-dossCard transition-all">
      {/* Doss Style Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-white border-b border-slate-100 text-xs gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 text-sm tracking-tight">
              {is3D ? "3D Scatter Projection" : "2D Scatter Projection"}
            </span>
            <span className="text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded-full">
              {points.length} samples
            </span>
          </div>

          {anomalyPoints.length > 0 && (
            <span className="flex items-center gap-1.5 text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full font-medium text-[11px]">
              <AlertTriangle className="w-3 h-3 text-rose-500" /> {anomalyPoints.length} Outliers
            </span>
          )}

          {/* Selected Cluster Pill Indicator */}
          {hasSelection && (
            <div className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-0.5 rounded-full text-[11px] font-medium shadow-xs animate-in fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span>เลือก {selectedPoints.length} จุด</span>
              <button
                onClick={handleClearSelection}
                title="ล้างการเลือก"
                className="hover:text-blue-200 ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Active Pin Pill Indicator */}
          {activePin && (
            <div className="flex items-center gap-1.5 bg-slate-800 text-white px-2.5 py-0.5 rounded-full text-[11px] font-medium">
              <span>Point #{activePin.id}</span>
              <span>•</span>
              <span>{activePin.is_anomaly ? "Outlier" : `Cluster ${activePin.cluster}`}</span>
              <button
                onClick={handleClearPin}
                title="ปิด Pin"
                className="hover:text-slate-300 ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* 2D / 3D Switcher */}
          {onToggle3D && (
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
              <button
                onClick={() => onToggle3D(false)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  !is3D
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                2D Mode
              </button>
              <button
                onClick={() => onToggle3D(true)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  is3D
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                3D Mode
              </button>
            </div>
          )}

          {/* Drag Mode Selector (Available in 2D Mode) */}
          {!is3D ? (
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
              <button
                onClick={() => setDragMode("pan")}
                title="Pan Mode (เลื่อนกราฟ)"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  dragMode === "pan"
                    ? "bg-white text-blue-700 shadow-2xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <MousePointer className="w-3 h-3" /> Pan
              </button>
              <button
                onClick={() => setDragMode("select")}
                title="Box Select (ลากสี่เหลี่ยมเลือกกลุ่มข้อมูล)"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  dragMode === "select"
                    ? "bg-white text-blue-700 shadow-2xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <BoxSelect className="w-3 h-3" /> Box
              </button>
              <button
                onClick={() => setDragMode("lasso")}
                title="Lasso Select (ลากเส้นอิสระครอบกลุ่มข้อมูล)"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  dragMode === "lasso"
                    ? "bg-white text-blue-700 shadow-2xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <LassoSelect className="w-3 h-3" /> Lasso
              </button>
            </div>
          ) : (
            onToggle3D && (
              <button
                onClick={() => onToggle3D(false)}
                className="text-[11px] text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-xl font-medium transition-colors"
                title="สลับเป็น 2D เพื่อลากครอบจุดแบบ Box หรือ Lasso"
              >
                สลับเป็น 2D เพื่อลากเลือกกลุ่มข้อมูล
              </button>
            )
          )}

          {/* Colorscale Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 rounded-xl px-2.5 py-1">
            <Palette className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-500 font-medium">Palette:</span>
            <select
              value={colorscale}
              onChange={(e) => setColorscale(e.target.value)}
              className="bg-transparent text-[11px] text-slate-800 font-medium outline-none cursor-pointer"
            >
              {COLORSCALES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Selection Button */}
          {hasSelection && (
            <button
              onClick={handleClearSelection}
              className="flex items-center gap-1 px-3 py-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200/90 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> ล้างการเลือก
            </button>
          )}

          {/* Reset Pin Button */}
          {annotations.length > 0 && (
            <button
              onClick={handleClearPin}
              className="flex items-center gap-1 px-3 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200/90 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> ล้าง Pin
            </button>
          )}
        </div>
      </div>

      {/* Plotly Canvas Container */}
      <div className="flex-1 w-full min-h-[560px] bg-white">
        {points.length > 0 ? (
          <Plot
            data={traces}
            layout={layout}
            useResizeHandler={true}
            style={{ width: "100%", height: "100%" }}
            onClick={handlePlotClick}
            onSelected={handlePlotSelected}
            onDeselect={handlePlotDeselect}
            config={{
              responsive: true,
              displayModeBar: true,
              displaylogo: false,
              modeBarButtonsToRemove: [],
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[560px] text-slate-400 text-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
              <Layers className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-slate-800 text-sm">พร้อมสำหรับการประมวลผลข้อมูล</p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                อัปโหลดไฟล์ข้อมูลเพื่อสร้างการแสดงผล Scatter Plot 2D หรือ 3D
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
